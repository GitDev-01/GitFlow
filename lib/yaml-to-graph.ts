import yaml from 'js-yaml';
import { FlowYamlConfig, FlowAppNode, FlowNodeType } from '@/types/flow';
import { Edge } from '@xyflow/react';
import { autoLayout } from './auto-layout';

export function parseYamlToGraph(yamlText: string): { nodes: FlowAppNode[], edges: Edge[] } {
    const config = yaml.load(yamlText) as FlowYamlConfig;
    const nodes: FlowAppNode[] = [];
    const edges: Edge[] = [];

    if (!config || !config.components) return { nodes, edges };

    // 1. Create START node
    if (config.flow?.entry_point) {
        nodes.push({
            id: 'start',
            type: 'start',
            position: { x: 0, y: 0 },
            data: { name: 'start' },
        });

        edges.push({
            id: `e-start-${config.flow.entry_point}`,
            source: 'start',
            target: config.flow.entry_point,
            type: 'router',
        });
    }

    // 2. Map Components
    const hasEndTarget = new Set<string>();

    config.components.forEach(comp => {
        let nodeType: FlowNodeType = 'agentComponent';
        if (comp.type === 'DeterministicStepComponent') nodeType = 'deterministicComponent';
        if (comp.type === 'OneOffComponent') nodeType = 'oneOffComponent';

        // Main component node
        nodes.push({
            id: comp.name,
            type: nodeType,
            position: { x: 0, y: 0 },
            data: { ...comp } as any,
        });

        // Handle Prompter node (for Agent and OneOff)
        if (comp.type !== 'DeterministicStepComponent' && (comp as any).prompt_id) {
            const c = comp as any;
            const prompterId = `prompter-${comp.name}`;

            const localPrompt = !c.prompt_version ? config.prompts?.find(p => p.prompt_id === c.prompt_id) : undefined;

            nodes.push({
                id: prompterId,
                type: 'prompter',
                position: { x: 0, y: 0 },
                data: {
                    prompt_id: c.prompt_id,
                    prompt_version: c.prompt_version,
                    prompt_template: localPrompt?.prompt_template,
                    isLocalPrompt: !c.prompt_version
                }
            });

            // Prompter no longer uses an edge connection 

            // edges.push({
            //     id: `deps-prompt-${comp.name}`,
            //     source: prompterId,
            //     target: comp.name,
            //     type: 'dependency',
            // });
        }

        // Toolbox component is deprecated and removed

        // Handle Toolbox node
        // if (comp.type !== 'DeterministicStepComponent' && (comp as any).toolset?.length > 0) {
        //     const toolboxId = `toolbox-${comp.name}`;
        //     nodes.push({
        //         id: toolboxId,
        //         type: 'toolbox',
        //         position: { x: 0, y: 0 },
        //         data: {
        //             toolset: (comp as any).toolset
        //         }
        //     });
        //     edges.push({
        //         id: `deps-tools-${comp.name}`,
        //         source: comp.name,
        //         target: toolboxId,
        //         type: 'dependency',
        //     });
        // }
    });

    // 3. Map Routers
    config.routers?.forEach(router => {
        if (router.to) {
            edges.push({
                id: `e-${router.from}-${router.to}`,
                source: router.from,
                target: router.to,
                type: 'router',
            });
            if (router.to === 'end') hasEndTarget.add('end');
        } else if (router.condition) {
            Object.entries(router.condition.routes).forEach(([label, target]) => {
                edges.push({
                    id: `e-${router.from}-${target}-${label}`,
                    source: router.from,
                    target: target,
                    label: label,
                    type: 'router',
                    data: { condition_input: router.condition?.input }
                });
                if (target === 'end') hasEndTarget.add('end');
            });
        }
    });

    // 4. Create END node
    if (hasEndTarget.size > 0 || Array.from(hasEndTarget).length > 0 || config.routers?.some(r => r.to === 'end' || (r.condition && Object.values(r.condition.routes).includes('end')))) {
        nodes.push({
            id: 'end',
            type: 'end',
            position: { x: 0, y: 0 },
            data: { name: 'end' },
        });
    }

    return autoLayout(nodes, edges);
}
