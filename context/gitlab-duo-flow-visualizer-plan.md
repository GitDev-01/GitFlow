# GitLab Duo Flow Visualizer — Agentic Build Plan

## Executive Summary

A React-based visual editor for GitLab Duo Flow `.yaml` files. Engineers can drag-and-drop components onto a canvas, connect them, configure properties inline, and export back to valid YAML — all with a UI that mirrors the provided mockups.

---

## 1. YAML → React Flow Translation Layer

This is the core of the platform. Here's the exact mapping:

### Parsing (YAML → Graph)

```
YAML components[] → React Flow nodes[]
YAML routers[]    → React Flow edges[]
YAML flow.entry_point → special "START" pseudo-node edge
```

Each `component` object becomes a node:

```yaml
# YAML
- name: "code_analyzer"
  type: AgentComponent
  prompt_id: "my_prompt"
  toolset: ["read_file", "list_dir"]
  inputs: ["context:goal"]
```

```js
// React Flow Node
{
  id: "code_analyzer",
  type: "agentComponent",      // maps to custom node renderer
  position: { x, y },          // auto-layout via dagre or stored in YAML comment metadata
  data: {
    name: "code_analyzer",
    prompt_id: "my_prompt",
    prompt_version: "^1.0.0",
    toolset: ["read_file", "list_dir"],
    inputs: ["context:goal"],
    ui_log_events: [],
    ui_role_as: "agent"
  }
}
```

Each `router` becomes an edge:

```yaml
# YAML — simple router
- from: "code_analyzer"
  to: "end"

# YAML — conditional router
- from: "file_processor"
  condition:
    input: "context:file_processor.execution_result"
    routes:
      "success": "next_step"
      "failed": "error_handler"
```

```js
// React Flow Edges
// Simple:
{ id: "e-code_analyzer-end", source: "code_analyzer", target: "end", label: "" }

// Conditional — one edge per route branch:
{ id: "e-fp-ns-success", source: "file_processor", target: "next_step",
  label: "success", data: { condition_input: "context:file_processor.execution_result" } }
{ id: "e-fp-eh-failed", source: "file_processor", target: "error_handler",
  label: "failed", data: { condition_input: "context:file_processor.execution_result" } }
```

**Special nodes added by the visualizer (not in YAML)**:
- `START` node — points to `flow.entry_point`
- `END` node — target of any `to: "end"` router
- Prompts from the `prompts[]` section become "Prompter" nodes, linked visually to their consuming component via a dashed edge (not a real router, but a logical dependency)

### Serializing (Graph → YAML)

Reverse of the above. On export:
1. Filter out `START`/`END`/`Prompter` pseudo-nodes
2. Map each remaining node back to its YAML component shape by `node.type`
3. Collapse conditional edges from the same source into a single `router` with `condition.routes`
4. Re-emit the `prompts[]` section from Prompter node data
5. Strip position metadata (or store it in a top-level `_visual` comment block for round-tripping)

---

## 2. Component Types — Visual Design & Config Panels

Each component type has a distinct visual card and a distinct right-panel properties form.

### `AgentComponent` — The AI Powerhouse

**Visual card**: Purple/indigo accent. Shows: name, `prompt_id` badge, number of tools badge.

**Connections**:
- One output handle (bottom) → routes to next component or `END`
- One **dashed** visual link to its `Prompter` node (if local prompt)
- One **dashed** visual link to a `Toolbox` node showing selected tools

**Properties panel contains**:
- Name (text input)
- `prompt_id` + `prompt_version` (text inputs, version defaults to null = local)
- Inline prompt editor (collapsible — system/user/placeholder textarea fields) — shown only when `prompt_version` is null
- `inputs[]` — dynamic list of `{from, as}` pairs with a `+` button
- `toolset[]` — **ToolSelect** multi-select with all known GitLab tools (grouped: File Ops, GitLab API, etc.)
- `ui_log_events[]` — checkbox group: `on_agent_final_answer`, `on_tool_execution_success`, `on_tool_execution_failed`
- `ui_role_as` — toggle: `agent` / `tool`

---

### `DeterministicStepComponent` — No LLM, No Prompter

**Visual card**: Teal/green accent. Shows: name, single tool badge prominently displayed.

**Key difference from other components**: No prompt needed at all. No `Prompter` node connection. No `Toolbox` multi-select. Instead, it gets a **single `ToolSelect` dropdown** (not multi) — picking one tool is the primary configuration act.

**Connections**:
- One output handle → next component or `END`
- **No Prompter link** (deterministic, no LLM)
- **No Toolbox node** — the single tool is shown inline on the card itself

**Properties panel contains**:
- Name (text input)
- `tool_name` — **single ToolSelect dropdown** (the most prominent field)
- `toolset[]` — optional override multi-select (advanced/collapsed by default)
- `inputs[]` — dynamic list of `{from, as, literal?}` pairs — critical here because these map directly to tool arguments
- `ui_log_events[]` — checkbox: `on_tool_execution_success`, `on_tool_execution_failed`
- `ui_role_as` — toggle (defaults to `"tool"`)

**UX note**: Because these are designed to be chained, selecting a `DeterministicStepComponent`'s output gives a suggestion to add another one.

---

### `OneOffComponent` — Single-Round AI with Tools

**Visual card**: Amber/orange accent. Shows: name, `prompt_id` badge, tool count badge, retry badge (max_correction_attempts).

**Sits between Agent and Deterministic** — has both a Prompter AND tools.

**Connections**:
- One output handle → next component or `END`
- **Dashed link to Prompter node** (same as AgentComponent)
- **Dashed link to Toolbox node** (multi-tool, same as AgentComponent)

**Properties panel contains**:
- Name (text input)
- `prompt_id` + `prompt_version`
- Inline prompt editor (same as AgentComponent, shown when version is null)
- `inputs[]` — dynamic list
- `toolset[]` — **ToolSelect multi-select** (same component as AgentComponent's toolbox)
- `max_correction_attempts` — number spinner (default 3)
- `ui_log_events[]` — checkbox: `on_tool_call_input`, `on_tool_execution_success`, `on_tool_execution_failed`

---

### `Prompter` (Visual-only pseudo-node)

**Visual card**: White/light, dashed border. Shows: `prompt_id`, first 60 chars of system prompt.

**Not a YAML component** — represents an entry in `prompts[]` or a reference to a registry prompt. Connected to its AgentComponent or OneOffComponent with a **dashed, non-routable edge**.

**Clicking it** opens an inline prompt editor with: system textarea, user textarea, placeholder toggle (history on/off), params (timeout, stop sequences).

If `prompt_version` is set (registry prompt), the card shows a "Registry Prompt" label and the editor is read-only/disabled.

---

### `Toolbox` (Visual-only pseudo-node)

**Visual card**: Gray, compact. Shows: badges for each selected tool name.

**Not a YAML component** — a visual grouping of the tools assigned to a component. Clicking opens the ToolSelect panel. Connected to its parent component with a **dashed edge**.

This mirrors the mockup's "Toolbox / Tool select / Badge 1 / Badge 2" design exactly.

---

### `START` and `END` (Visual-only pseudo-nodes)

Simple rounded pills. `START` is green, `END` is red. `START` has a single output → `flow.entry_point`. `END` receives any `to: "end"` router edge.

---

## 3. Shared Components

### `ToolSelect`

A reusable shadcn `Popover` + `Command` (combobox) component used in three contexts with different modes:

| Context | Mode | Component using it |
|---|---|---|
| AgentComponent toolset | **Multi-select** | AgentComponent, OneOffComponent |
| DeterministicStepComponent tool_name | **Single-select** | DeterministicStepComponent |
| Toolbox pseudo-node | **Multi-select display** | Toolbox node |

**Tool groups pre-populated from docs**:
- **File Operations**: `read_file`, `create_file_with_contents`, `edit_file`, `list_dir`, `find_files`
- **GitLab API**: `get_issue`, `create_issue`, `get_merge_request`, `create_merge_request`, `list_issues`
- **Git**: `git_log`, `git_diff`, `git_show`
- **Custom**: free-text input for tools not in the registry

---

## 4. Application Architecture

```
src/
├── app/
│   ├── page.tsx                  # Main layout: sidebar + canvas
│   └── layout.tsx
├── components/
│   ├── canvas/
│   │   ├── FlowCanvas.tsx        # ReactFlow wrapper, global config
│   │   ├── edges/
│   │   │   ├── RouterEdge.tsx    # Solid line, label for condition value
│   │   │   └── DependencyEdge.tsx# Dashed line, Prompter/Toolbox links
│   │   └── nodes/
│   │       ├── AgentNode.tsx
│   │       ├── DeterministicNode.tsx
│   │       ├── OneOffNode.tsx
│   │       ├── PrompterNode.tsx
│   │       ├── ToolboxNode.tsx
│   │       └── StartEndNode.tsx
│   ├── sidebar/
│   │   ├── WorkflowList.tsx      # Left panel: list of flows
│   │   └── ComponentPalette.tsx  # Drag source for new nodes
│   ├── panels/
│   │   ├── PropertiesPanel.tsx   # Right panel, switches by node type
│   │   ├── AgentProperties.tsx
│   │   ├── DeterministicProperties.tsx
│   │   ├── OneOffProperties.tsx
│   │   └── PrompterProperties.tsx
│   ├── shared/
│   │   ├── ToolSelect.tsx        # Reusable single/multi tool picker
│   │   ├── InputsList.tsx        # Dynamic {from, as} pair editor
│   │   └── YamlImportDialog.tsx  # Paste YAML or upload .yaml file
│   └── toolbar/
│       └── Toolbar.tsx           # Export, import, environment badge
├── lib/
│   ├── yaml-to-graph.ts          # YAML → {nodes, edges} parser
│   ├── graph-to-yaml.ts          # {nodes, edges} → YAML serializer
│   ├── auto-layout.ts            # dagre layout for imported flows
│   └── tools-registry.ts        # Known GitLab tools with metadata
├── store/
│   └── flow-store.ts             # Zustand store: flows[], activeFlow, selection
└── types/
    └── flow.ts                   # TypeScript types mirroring YAML schema
```

---

## 5. Key UX Flows

### Import a YAML file
1. Click `+` button in workflow list (top right per mockup) → `YamlImportDialog`
2. Paste YAML text or drag-and-drop `.yaml` file
3. `yaml-to-graph.ts` parses → calls `auto-layout.ts` (dagre, left-to-right) → sets nodes/edges in Zustand store
4. Canvas renders immediately

### Add a component
1. Drag from left palette onto canvas → node created at drop position
2. Properties panel opens on right for that node type
3. Prompter and Toolbox pseudo-nodes auto-created and positioned near the parent (for AgentComponent / OneOffComponent)

### Connect components
1. Drag from output handle to input handle → creates a `RouterEdge`
2. If the edge source already has a router with `condition`, a dialog asks: "Add as conditional route? Enter route value (success/failed/custom)"

### Export
1. Click `Export` button (bottom right per mockup)
2. `graph-to-yaml.ts` runs → shows a modal with the YAML, copy button, and download `.yaml` button

---

## 6. Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Standard |
| Graph canvas | `@xyflow/react` (React Flow v12) | Best-in-class, matches mockup |
| Layout algorithm | `dagre` | Auto-layout for imported YAMLs |
| State | Zustand | Simple, works well with React Flow |
| YAML parsing | `js-yaml` | Bidirectional, well-maintained |
| UI components | `shadcn/ui` | Specified in brief |
| Styling | Tailwind CSS | Required by shadcn |
| Icons | `lucide-react` | Ships with shadcn |

---

## 7. Phase Plan

### Phase 1 — Canvas Shell & Node Rendering
- Set up Next.js + React Flow + shadcn
- Implement all 5 node types visually (no interactivity yet)
- `START`/`END` nodes, `RouterEdge`, `DependencyEdge`
- Hardcode a sample flow to validate layout

### Phase 2 — YAML ↔ Graph Serialization
- Build `yaml-to-graph.ts` with full router handling (simple + conditional)
- Build `graph-to-yaml.ts`
- `auto-layout.ts` using dagre
- `YamlImportDialog` + `Export` modal
- Round-trip test with all 3 docs examples

### Phase 3 — Properties Panels & ToolSelect
- Properties panel routing by node type
- All field editors per component (inputs list, prompt editor, log events)
- `ToolSelect` in single and multi-select modes
- Prompter inline editor with registry vs. local toggle

### Phase 4 — Workflow List & Multi-flow Management
- Sidebar workflow list (from mockup left panel)
- Multiple flows open simultaneously, tab-style
- Per-flow Zustand slice

### Phase 5 — Polish & Validation
- Validation: warn if `DeterministicStepComponent` has no `tool_name`, if `AgentComponent` has no `prompt_id`, if entry_point references non-existent component
- Conditional edge UI (route value labels, colour coding success=green/failed=red)
- Minimap, keyboard shortcuts, undo/redo (React Flow's built-in history)
