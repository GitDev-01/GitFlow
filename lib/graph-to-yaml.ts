import yaml from 'js-yaml';
import { FlowYamlConfig, FlowAppNode, AnyComponent, LocalPrompt, RouterConfig } from '@/types/flow';
import { Edge } from '@xyflow/react';
import { sortEdges } from './sorting';

export function parseGraphToYaml(
    nodes: FlowAppNode[],
    edges: Edge[],
    baseConfig: Partial<FlowYamlConfig> = {}
): string {
    const components: AnyComponent[] = [];
    const prompts: LocalPrompt[] = [];
    const routers: RouterConfig[] = [];
    let entryPoint: string | undefined = undefined;

    // An index for Id to name mappings
    const nodeNameIndex: Record<string, string> = {}

    // Process nodes
    nodes.forEach(node => {
        if (['agentComponent', 'deterministicComponent', 'oneOffComponent'].includes(node.type as string)) {
            // Remove React Flow specific properties, keep component properties
            const { name, prompt_id, prompt_version, toolset, tool_name, inputs, ui_log_events, ui_role_as, max_correction_attempts } = node.data;

            const compBase: any = {
                name: name || node.id, // Using node ID as name for exact 1:1 mapping
                type: node.type === 'agentComponent' ? 'AgentComponent' :
                    node.type === 'deterministicComponent' ? 'DeterministicStepComponent' : 'OneOffComponent'
            };

            if (prompt_id) compBase.prompt_id = prompt_id;
            if (prompt_version !== undefined && prompt_version !== null && prompt_version !== '') compBase.prompt_version = prompt_version;
            if (toolset && toolset.length > 0 && toolset[0] !== "null") compBase.toolset = toolset;
            if (tool_name) compBase.tool_name = tool_name;
            if (inputs && inputs.length > 0) compBase.inputs = inputs;
            if (ui_log_events && ui_log_events.length > 0) compBase.ui_log_events = ui_log_events;
            if (ui_role_as && ui_role_as !== "null") compBase.ui_role_as = ui_role_as;
            if (max_correction_attempts !== undefined) compBase.max_correction_attempts = max_correction_attempts;

            components.push(compBase as AnyComponent);
        } else if (node.type === 'prompter') {
            if (node.data.prompt_id && node.data.prompt_template) {
                
                if (node.data.prompt_template.placeholder === "null") delete node.data.prompt_template.placeholder

                prompts.push({
                    prompt_id: node.data.prompt_id,
                    prompt_template: node.data.prompt_template,
                    ...(node.data.prompt_params ? { params: node.data.prompt_params } : {})
                });
            }
        }
        nodeNameIndex[node.id] = node.data.name || node.id
    });

    // Process edges for Routers and Entry Point
    const edgesBySource: Record<string, Edge[]> = {};

    // Edges need to be sorted for routing
    const sortedEdges: Edge[] = sortEdges(edges)

    console.log(sortedEdges)

    sortedEdges.forEach(edge => {
        if (edge.type === 'dependency') return;

        if (edge.source === 'start') {
            entryPoint = edge.target;
        } else {
            if (!edgesBySource[edge.source]) edgesBySource[edge.source] = [];
            edgesBySource[edge.source].push(edge);
        }
    });


    Object.entries(edgesBySource).forEach(([source, sourceEdges]) => {
        // Check if it's a simple route or conditional
        const conditionalEdges = sourceEdges.filter(e => e.label || e.data?.condition_input);
        const simpleEdges = sourceEdges.filter(e => !e.label && !e.data?.condition_input);

        if (conditionalEdges.length > 0) {
            // It's a conditional router
            const conditionInput = conditionalEdges[0].data?.condition_input as string || `context:${source}.execution_result`;
            const routes: Record<string, string> = {};

            conditionalEdges.forEach(e => {
                if (e.label && typeof e.label === 'string') {
                    routes[e.label] = e.target;
                }
            });

            routers.push({
                from: source,
                condition: {
                    input: conditionInput,
                    routes
                }
            });
        }

        if (simpleEdges.length > 0) {
            simpleEdges.forEach(e => {
                routers.push({
                    from: nodeNameIndex[source],
                    to: nodeNameIndex[e.target]
                });
            });
        }
    });

    const finalConfig: FlowYamlConfig = {
        version: baseConfig.version || 'v1',
        environment: baseConfig.environment || 'ambient',
        ...(baseConfig.name ? { name: baseConfig.name } : {}),
        ...(baseConfig.description ? { description: baseConfig.description } : {}),
        ...(baseConfig.product_group ? { product_group: baseConfig.product_group } : {}),
        components,
        ...(prompts.length > 0 ? { prompts } : {}),
        routers,
        flow: {
            ...baseConfig.flow,
            ...(entryPoint ? { entry_point: entryPoint } : {})
        }
    };

    return yaml.dump(finalConfig, { noRefs: true, sortKeys: false });
}
