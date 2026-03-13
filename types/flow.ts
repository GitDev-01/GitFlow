import { Node, Edge } from '@xyflow/react';

export type FlowEnvironment = 'ambient' | 'chat' | 'chat-partial';

export interface ComponentInputObject {
  from: string;
  as: string;
  literal?: boolean;
}

export type ComponentInput = ComponentInputObject | string;

export interface PromptTemplate {
  system?: string;
  user?: string;
  placeholder?: string;
}

export interface LocalPrompt {
  prompt_id: string;
  name?: string;
  unit_primitives?: string[];
  prompt_template: PromptTemplate;
  params?: {
    timeout?: number;
    stop?: string[];
    vertex_location?: string;
  };
}

export interface RouterConditionRoute {
  [key: string]: string; // e.g. "success": "next_step"
}

export interface RouterCondition {
  input: string;
  routes: RouterConditionRoute;
}

export interface RouterConfig {
  from: string;
  to?: string;
  condition?: RouterCondition;
}

export interface FlowEntryPoint {
  entry_point?: string;
}

export interface BaseComponent {
  name: string;
  type: string;
  ui_log_events?: string[];
  ui_role_as?: 'agent' | 'tool';
  inputs?: ComponentInput[];
}

export interface AgentComponent extends BaseComponent {
  type: 'AgentComponent';
  prompt_id: string;
  prompt_version?: string | null;
  toolset?: string[];
}

export interface DeterministicStepComponent extends BaseComponent {
  type: 'DeterministicStepComponent';
  tool_name: string;
  toolset?: string[];
}

export interface OneOffComponent extends BaseComponent {
  type: 'OneOffComponent';
  prompt_id: string;
  prompt_version?: string | null;
  toolset?: string[];
  max_correction_attempts?: number;
}

export type AnyComponent = AgentComponent | DeterministicStepComponent | OneOffComponent;

export interface FlowYamlConfig {
  version: 'v1';
  environment: FlowEnvironment;
  components: AnyComponent[];
  prompts?: LocalPrompt[];
  routers?: RouterConfig[];
  flow?: FlowEntryPoint;
  name?: string;
  description?: string;
  product_group?: string;
}

// React Flow Types

export type FlowNodeType = 'agentComponent' | 'deterministicComponent' | 'oneOffComponent' | 'prompter' | 'toolbox' | 'start' | 'end';

export type FlowNodeData = {
  // Shared
  name?: string;
  
  // Agent / OneOff / Deterministic
  prompt_id?: string;
  prompt_version?: string | null;
  toolset?: string[];
  tool_name?: string;
  inputs?: ComponentInput[];
  ui_log_events?: string[];
  ui_role_as?: string;
  max_correction_attempts?: number;

  // Prompter specific
  prompt_template?: PromptTemplate;
  prompt_params?: any;
  isLocalPrompt?: boolean;
};

export type FlowAppNode = Node<FlowNodeData, FlowNodeType>;
