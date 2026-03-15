import { parseYamlToGraph } from '@/lib/yaml-to-graph';

describe('yaml-to-graph parser', () => {
    it('should return empty arrays for invalid or empty YAML', () => {
        const { nodes, edges } = parseYamlToGraph('');
        expect(nodes).toEqual([]);
        expect(edges).toEqual([]);
    });

    it('should parse a basic component and create START and END nodes', () => {
        const basicYaml = `
version: "v1"
environment: ambient
components:
  - name: "my_agent"
    type: AgentComponent
flow:
  entry_point: "my_agent"
routers:
  - from: "my_agent"
    to: "end"
    `;

        const { nodes, edges } = parseYamlToGraph(basicYaml);

        // Nodes: START, my_agent, END
        expect(nodes.length).toBeGreaterThanOrEqual(3);
        expect(nodes.find(n => n.id === 'START')).toBeDefined();
        expect(nodes.find(n => n.id === 'end')).toBeDefined();
        expect(nodes.find(n => n.id === 'my_agent')).toBeDefined();

        // Edges: START -> my_agent, my_agent -> end
        expect(edges.find(e => e.source === 'start' && e.target === 'my_agent')).toBeDefined();
        expect(edges.find(e => e.source === 'my_agent' && e.target === 'end')).toBeDefined();
    });
});
