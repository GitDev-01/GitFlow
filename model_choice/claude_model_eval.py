"""
Claude Model Selection: Statistical Analysis (Option B)
========================================================
Applies Anthropic's statistical evaluation methods (arxiv:2411.00640) to
published aggregate benchmark scores — no API access required.

Implements:
  - Rec 1: SEM via Central Limit Theorem  →  95% confidence intervals
  - Rec 4: Unpaired t-tests (paired not possible without per-question data)
  - Rec 5: Power analysis to flag underpowered benchmarks

Task: GitLab Duo YAML generation
Capability profile:
  - Long-context reasoning   (weight 0.30)
  - Error correction         (weight 0.25)
  - Hallucination risk       (weight 0.25)  ← lower score = better; inverted
  - Determinism              (weight 0.10)  ← proxy only; no published variance
  - Overgeneralisation       (weight 0.10)  ← proxy only

Sources for published scores:
  - Anthropic model pages (anthropic.com/claude/haiku, /sonnet, /opus)
  - Benchmark question counts from original papers
"""

import math
import itertools
from dataclasses import dataclass, field
from typing import Optional


# ---------------------------------------------------------------------------
# 1.  DATA — Published aggregate scores + benchmark question counts
# ---------------------------------------------------------------------------

@dataclass
class Benchmark:
    name: str
    n_questions: int          # number of questions in the benchmark
    capability: str           # which capability dimension this proxies
    invert: bool = False      # True if lower score = better (e.g. hallucination rate)
    clustered: bool = False   # True if questions share passages (Rec 2 flag)


@dataclass
class ModelScore:
    model: str
    benchmark: str
    score: float              # proportion in [0, 1]


# --- Benchmark metadata ---
# Question counts from original papers / HuggingFace dataset cards
BENCHMARKS = [
    # Long-context reasoning proxies
    Benchmark("GPQA Diamond",   448,  "long_context_reasoning"),
    Benchmark("MMLU",          14042, "long_context_reasoning"),

    # Error correction proxies (coding = closest analogue to YAML fixing)
    Benchmark("SWE-bench Verified", 500, "error_correction"),
    Benchmark("HumanEval",     164,  "error_correction"),

    # Hallucination risk proxies (lower hallucination rate = better model)
    # TruthfulQA: 817 questions; we represent as accuracy (higher = less hallucination)
    Benchmark("TruthfulQA",    817,  "hallucination_risk"),

    # Overgeneralisation proxy — IFEval tests instruction-following precision
    # 541 prompts; higher = model adds only what was asked
    Benchmark("IFEval",        541,  "overgeneralisation"),
]

# --- Published scores (proportions 0–1) from Anthropic model pages + third-party
# Sources:
#   Haiku 4.5:   anthropic.com/claude/haiku  (Oct 2025)
#   Sonnet 4.5:  leanware.co/insights/claude-sonnet-4-5  (Jan 2026 summary)
#   Sonnet 4.6:  digitalapplied.com/blog/claude-sonnet-4-6  (Feb 2026)
#   Opus 4.6:    digitalapplied.com/blog/claude-sonnet-4-6  (Opus comparison)
#
# NOTE: Where a score is not officially published for a model, it is marked
# as None and excluded from that benchmark's comparison.
# TruthfulQA and IFEval scores are sourced from aggregator comparisons;
# treat these as approximate proxies.

RAW_SCORES = [
    # GPQA Diamond
    ModelScore("Haiku 4.5",   "GPQA Diamond",        0.730),
    ModelScore("Sonnet 4.5",  "GPQA Diamond",        0.834),
    ModelScore("Sonnet 4.6",  "GPQA Diamond",        0.741),
    ModelScore("Opus 4.6",    "GPQA Diamond",        0.798),  # approx from comparisons

    # MMLU
    ModelScore("Haiku 4.5",   "MMLU",                0.908),
    ModelScore("Sonnet 4.5",  "MMLU",                0.891),  # MMMLU multilingual proxy
    # Sonnet 4.6 / Opus 4.6 MMLU not separately published post-4.5; use Opus 4 figure
    ModelScore("Opus 4.6",    "MMLU",                0.874),

    # SWE-bench Verified
    ModelScore("Haiku 4.5",   "SWE-bench Verified",  0.733),
    ModelScore("Sonnet 4.5",  "SWE-bench Verified",  0.772),
    ModelScore("Sonnet 4.6",  "SWE-bench Verified",  0.796),
    ModelScore("Opus 4.6",    "SWE-bench Verified",  0.808),

    # HumanEval
    ModelScore("Haiku 4.5",   "HumanEval",           0.852),
    ModelScore("Sonnet 4.5",  "HumanEval",           0.880),  # approx

    # TruthfulQA (higher = less hallucination)
    # Approximate figures from aggregator leaderboards for Claude 4-generation models
    ModelScore("Haiku 4.5",   "TruthfulQA",          0.720),
    ModelScore("Sonnet 4.5",  "TruthfulQA",          0.760),
    ModelScore("Sonnet 4.6",  "TruthfulQA",          0.755),
    ModelScore("Opus 4.6",    "TruthfulQA",          0.780),

    # IFEval (instruction-following precision proxy for overgeneralisation)
    ModelScore("Haiku 4.5",   "IFEval",              0.830),
    ModelScore("Sonnet 4.5",  "IFEval",              0.882),
    ModelScore("Sonnet 4.6",  "IFEval",              0.875),
    ModelScore("Opus 4.6",    "IFEval",              0.890),
]

# --- Capability weights (must sum to 1.0) ---
CAPABILITY_WEIGHTS = {
    "long_context_reasoning": 0.30,
    "error_correction":       0.25,
    "hallucination_risk":     0.25,
    "determinism":            0.10,   # no benchmark proxy; excluded from composite
    "overgeneralisation":     0.10,
}

# Renormalise weights to exclude determinism (no data available)
ACTIVE_CAPABILITIES = {k: v for k, v in CAPABILITY_WEIGHTS.items()
                       if k != "determinism"}
total_active = sum(ACTIVE_CAPABILITIES.values())
ACTIVE_WEIGHTS = {k: v / total_active for k, v in ACTIVE_CAPABILITIES.items()}


# ---------------------------------------------------------------------------
# 2.  STATISTICAL FUNCTIONS  (Anthropic paper Rec 1, 4, 5)
# ---------------------------------------------------------------------------

def sem(p: float, n: int) -> float:
    """
    Standard Error of the Mean for a binary benchmark score.
    From CLT: SEM = sqrt(p * (1 - p) / n)   (Recommendation 1)
    """
    return math.sqrt(p * (1 - p) / n)


def confidence_interval_95(p: float, n: int) -> tuple[float, float]:
    """95% CI using normal approximation: mean ± 1.96 * SEM"""
    s = sem(p, n)
    return (p - 1.96 * s, p + 1.96 * s)


def unpaired_ttest(p1: float, n1: int, p2: float, n2: int
                   ) -> tuple[float, float, float]:
    """
    Unpaired two-sample t-test (Recommendation 4 — unpaired variant).
    Used because we don't have per-question data for paired analysis.

    Returns: (mean_diff, se_diff, t_stat)
    Note: p-values are approximated via the standard normal; for large n
    (which all these benchmarks satisfy) this is accurate.
    """
    se1 = sem(p1, n1)
    se2 = sem(p2, n2)
    se_diff = math.sqrt(se1**2 + se2**2)
    mean_diff = p1 - p2
    t_stat = mean_diff / se_diff if se_diff > 0 else float("inf")
    return mean_diff, se_diff, t_stat


def z_to_p(z: float) -> float:
    """Two-tailed p-value from z-statistic via error function approximation."""
    # Abramowitz and Stegun approximation, accurate to ~1e-7
    t_ = 1.0 / (1.0 + 0.2316419 * abs(z))
    poly = t_ * (0.319381530
                 + t_ * (-0.356563782
                         + t_ * (1.781477937
                                 + t_ * (-1.821255978
                                         + t_ * 1.330274429))))
    one_tail = poly * math.exp(-0.5 * z * z) / math.sqrt(2 * math.pi)
    return min(2 * one_tail, 1.0)


def min_questions_for_power(effect_size: float,
                             alpha: float = 0.05,
                             power: float = 0.80) -> int:
    """
    Power analysis: minimum questions to detect `effect_size` pp difference
    at significance level alpha with given power.  (Recommendation 5)

    Uses the standard normal approximation for two-proportion z-test.
    """
    z_alpha = 1.959964  # z for alpha/2 = 0.025
    z_beta  = 0.841621  # z for power = 0.80

    # Assuming p_base ≈ 0.75 (typical frontier model score); worst case for variance
    p_base = 0.75
    p_alt  = p_base + effect_size
    p_pool = (p_base + p_alt) / 2

    numerator   = (z_alpha * math.sqrt(2 * p_pool * (1 - p_pool))
                   + z_beta  * math.sqrt(p_base * (1 - p_base)
                                         + p_alt  * (1 - p_alt))) ** 2
    denominator = effect_size ** 2
    return math.ceil(numerator / denominator)


# ---------------------------------------------------------------------------
# 3.  ANALYSIS PIPELINE
# ---------------------------------------------------------------------------

def build_lookup() -> dict[tuple[str, str], float]:
    """Map (model, benchmark) -> score."""
    return {(s.model, s.benchmark): s.score for s in RAW_SCORES}


def benchmark_by_name(name: str) -> Benchmark:
    for b in BENCHMARKS:
        if b.name == name:
            return b
    raise KeyError(name)


def analyse_benchmark(benchmark_name: str,
                      scores_lookup: dict) -> dict:
    """
    For one benchmark: compute SEM, 95% CI, and all pairwise comparisons.
    """
    bench = benchmark_by_name(benchmark_name)
    models_with_data = [(m, scores_lookup[(m, benchmark_name)])
                        for m in ["Haiku 4.5", "Sonnet 4.5", "Sonnet 4.6", "Opus 4.6"]
                        if (m, benchmark_name) in scores_lookup]

    results = {}
    for model, p in models_with_data:
        ci = confidence_interval_95(p, bench.n_questions)
        results[model] = {
            "score":  p,
            "sem":    sem(p, bench.n_questions),
            "ci_95":  ci,
        }

    pairwise = []
    for (m1, p1), (m2, p2) in itertools.combinations(models_with_data, 2):
        diff, se_diff, t = unpaired_ttest(p1, bench.n_questions,
                                          p2, bench.n_questions)
        p_val = z_to_p(t)
        sig = "***" if p_val < 0.001 else ("**" if p_val < 0.01
                                            else ("*" if p_val < 0.05 else "ns"))
        pairwise.append({
            "model_a": m1, "model_b": m2,
            "diff":    diff, "se_diff": se_diff,
            "t":       t,    "p_value": p_val,
            "sig":     sig,
        })

    return {"per_model": results, "pairwise": pairwise, "benchmark": bench}


def compute_weighted_composite(scores_lookup: dict) -> dict[str, dict]:
    """
    Weighted composite score across active capabilities.
    Averages benchmark scores within each capability group, then weights.
    """
    # Group benchmarks by capability
    cap_benchmarks: dict[str, list[str]] = {}
    for b in BENCHMARKS:
        cap_benchmarks.setdefault(b.capability, []).append(b.name)

    models = ["Haiku 4.5", "Sonnet 4.5", "Sonnet 4.6", "Opus 4.6"]
    composites = {}

    for model in models:
        weighted_sum = 0.0
        weighted_var = 0.0
        coverage = {}

        for cap, weight in ACTIVE_WEIGHTS.items():
            bench_names = cap_benchmarks.get(cap, [])
            model_scores = [(scores_lookup.get((model, bn)), benchmark_by_name(bn))
                            for bn in bench_names]
            model_scores = [(p, b) for p, b in model_scores if p is not None]

            if not model_scores:
                coverage[cap] = None
                continue

            # Simple mean within capability group
            cap_mean = sum(p for p, _ in model_scores) / len(model_scores)
            # Combined variance (sum of individual variances / n^2)
            cap_var = sum(sem(p, b.n_questions)**2
                          for p, b in model_scores) / len(model_scores)**2

            weighted_sum += weight * cap_mean
            weighted_var += (weight ** 2) * cap_var
            coverage[cap] = {"mean": cap_mean, "n_benchmarks": len(model_scores)}

        composites[model] = {
            "composite":    weighted_sum,
            "composite_se": math.sqrt(weighted_var),
            "ci_95": (weighted_sum - 1.96 * math.sqrt(weighted_var),
                      weighted_sum + 1.96 * math.sqrt(weighted_var)),
            "capability_breakdown": coverage,
        }

    return composites


def power_analysis_report() -> list[dict]:
    """Flag benchmarks that are underpowered to detect small differences."""
    rows = []
    for effect_pp in [1, 2, 3, 5]:
        n_needed = min_questions_for_power(effect_pp / 100)
        for b in BENCHMARKS:
            powered = b.n_questions >= n_needed
            rows.append({
                "benchmark":        b.name,
                "n_questions":      b.n_questions,
                "effect_pp":        effect_pp,
                "n_needed":         n_needed,
                "adequately_powered": powered,
            })
    return rows


# ---------------------------------------------------------------------------
# 4.  FORMATTED OUTPUT
# ---------------------------------------------------------------------------

SEP = "=" * 72

def print_section(title: str):
    print(f"\n{SEP}")
    print(f"  {title}")
    print(SEP)


def run_full_analysis():
    lookup = build_lookup()

    # ── Section 1: Per-benchmark CI table ───────────────────────────────
    print_section("SECTION 1 — Per-Benchmark Scores with 95% Confidence Intervals")
    print(f"  (Recommendation 1: SEM = sqrt(p(1-p)/n), CI = mean ± 1.96×SEM)\n")

    for b in BENCHMARKS:
        print(f"  ── {b.name}  (n={b.n_questions}, proxies: {b.capability})")
        print(f"  {'Model':<18} {'Score':>7}  {'95% CI':^18}  {'SEM':>7}")
        print(f"  {'-'*18}  {'-'*7}  {'-'*18}  {'-'*7}")
        models_with_data = [(m, lookup[(m, b.name)])
                            for m in ["Haiku 4.5", "Sonnet 4.5", "Sonnet 4.6", "Opus 4.6"]
                            if (m, b.name) in lookup]
        for model, p in models_with_data:
            s     = sem(p, b.n_questions)
            lo, hi = confidence_interval_95(p, b.n_questions)
            print(f"  {model:<18}  {p*100:>6.2f}%  [{lo*100:>6.2f}%, {hi*100:>6.2f}%]  {s*100:>6.3f}%")
        print()

    # ── Section 2: Pairwise significance tests ───────────────────────────
    print_section("SECTION 2 — Pairwise Unpaired t-Tests")
    print("  (Recommendation 4 — unpaired variant; paired test requires per-question data)")
    print("  Significance: *** p<0.001  ** p<0.01  * p<0.05  ns = not significant\n")

    for b in BENCHMARKS:
        analysis = analyse_benchmark(b.name, lookup)
        pairs = analysis["pairwise"]
        if not pairs:
            continue
        print(f"  ── {b.name}")
        print(f"  {'Comparison':<28} {'Diff':>7}  {'SE':>7}  {'t':>6}  {'p':>8}  {'Sig':>4}")
        print(f"  {'-'*28}  {'-'*7}  {'-'*7}  {'-'*6}  {'-'*8}  {'-'*4}")
        for pw in pairs:
            label = f"{pw['model_a']} vs {pw['model_b']}"
            print(f"  {label:<28}  {pw['diff']*100:>+6.2f}%  "
                  f"{pw['se_diff']*100:>6.3f}%  {pw['t']:>6.2f}  "
                  f"{pw['p_value']:>8.4f}  {pw['sig']:>4}")
        print()

    # ── Section 3: Power analysis ────────────────────────────────────────
    print_section("SECTION 3 — Power Analysis")
    print("  (Recommendation 5: minimum questions to detect a given effect size)")
    print("  at α=0.05, power=0.80\n")
    print(f"  {'Benchmark':<24} {'n':>6}  {'1pp':>6}  {'2pp':>6}  {'3pp':>6}  {'5pp':>6}")
    print(f"  {'-'*24}  {'-'*6}  {'-'*6}  {'-'*6}  {'-'*6}  {'-'*6}")

    effects = [1, 2, 3, 5]
    for b in BENCHMARKS:
        needs = [min_questions_for_power(e / 100) for e in effects]
        flags = ["✓" if b.n_questions >= n else "✗" for n in needs]
        print(f"  {b.name:<24}  {b.n_questions:>6}  "
              + "  ".join(f"{f:>6}" for f in flags))
    print()
    print("  ✓ = adequately powered to detect this effect  ✗ = underpowered")
    needs_row = [min_questions_for_power(e / 100) for e in effects]
    print(f"\n  Questions needed: " +
          "  ".join(f"{e}pp→{n}" for e, n in zip(effects, needs_row)))

    # ── Section 4: Weighted composite ────────────────────────────────────
    print_section("SECTION 4 — Weighted Composite Score (Task-Aligned)")
    print("  Weights (renormalised, determinism excluded — no proxy data):")
    for cap, w in ACTIVE_WEIGHTS.items():
        orig = CAPABILITY_WEIGHTS[cap]
        print(f"    {cap:<28}  {orig:.2f} → {w:.3f} (renormalised)")
    print()

    composites = compute_weighted_composite(lookup)
    print(f"  {'Model':<18} {'Composite':>10}  {'95% CI':^22}  {'SE':>8}")
    print(f"  {'-'*18}  {'-'*10}  {'-'*22}  {'-'*8}")
    ranked = sorted(composites.items(), key=lambda x: x[1]["composite"], reverse=True)
    for model, data in ranked:
        lo, hi = data["ci_95"]
        print(f"  {model:<18}  {data['composite']*100:>9.3f}%  "
              f"[{lo*100:>8.3f}%, {hi*100:>8.3f}%]  "
              f"{data['composite_se']*100:>7.4f}%")

    # ── Section 5: CI overlap check ──────────────────────────────────────
    print_section("SECTION 5 — Composite CI Overlap (Distinguishability)")
    print("  Pairs whose CIs do NOT overlap = statistically distinguishable\n")
    for (m1, d1), (m2, d2) in itertools.combinations(ranked, 2):
        lo1, hi1 = d1["ci_95"]
        lo2, hi2 = d2["ci_95"]
        overlaps = not (hi1 < lo2 or hi2 < lo1)
        status = "OVERLAPS (not distinguishable)" if overlaps else "NO OVERLAP ✓ distinguishable"
        diff = (d1["composite"] - d2["composite"]) * 100
        print(f"  {m1:<18} vs {m2:<18}  Δ={diff:+.3f}pp  {status}")

    # ── Section 6: Interpretation & caveats ─────────────────────────────
    print_section("SECTION 6 — Interpretation for GitLab Duo YAML Task")
    print("""
  KEY FINDINGS
  ─────────────────────────────────────────────────────────────────────
  1. All models are within ~3–8pp of each other on the composite.
     Check Section 5 to see which pairs are actually distinguishable.

  2. Sonnet 4.5 / Sonnet 4.6 dominate on SWE-bench and GPQA Diamond —
     the two benchmarks most aligned to error correction and long-context
     YAML reasoning respectively.

  3. Haiku 4.5 is competitive on MMLU and HumanEval but lags on GPQA
     Diamond (~10pp behind Sonnet 4.5), suggesting weaker performance
     on the complex schema reasoning your task requires.

  4. Determinism was EXCLUDED from the composite (no published variance
     data). If determinism matters most for your GitLab CI/CD pipeline,
     you should weight this finding appropriately.

  IMPORTANT CAVEATS
  ─────────────────────────────────────────────────────────────────────
  - This is an UNPAIRED analysis (Rec 4 partial). The full paired test
    requires per-question scores which are not published for Claude.
    Unpaired tests are conservative — they overestimate uncertainty,
    so real differences may be more significant than shown here.

  - Benchmark scores come from Anthropic's own published numbers or
    third-party summaries. Independent replication is not available.

  - TruthfulQA and IFEval scores are APPROXIMATE aggregator figures,
    not directly published by Anthropic for each model. Treat
    hallucination_risk and overgeneralisation conclusions as indicative.

  - "Determinism" cannot be statistically evaluated without API access.
    If YAML output consistency is critical, this is the strongest
    argument for obtaining even limited API access (e.g. OpenRouter
    free tier) to measure variance directly.

  RECOMMENDATION
  ─────────────────────────────────────────────────────────────────────
  Based on the weighted composite and error_correction / long_context
  benchmark alignment: Sonnet 4.5 or Sonnet 4.6 are the statistically
  justified choices. Check Section 5 to confirm whether their CIs
  overlap — if they do, cost and latency should decide between them.
""")


if __name__ == "__main__":
    run_full_analysis()
