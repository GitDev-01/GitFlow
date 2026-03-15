// app/api/[transport]/route.ts
import { eventBus } from "@/lib/events";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "push_ui_config",
      {
        description: "Updates the application UI using a YAML configuration string.",
        inputSchema: { yamlString: z.string().describe("The YAML string defining the new UI state") },
      },
      async ({ yamlString }) => {
        eventBus.emit("ui-push", { type: "YAML_UPDATE", data: yamlString });
        return { content: [{ type: "text", text: `✅ UI configuration pushed.` }] };
      }
    );
  },
  {},
  { basePath: "/api/gitflow", maxDuration: 60 }
);

export { handler as GET, handler as POST };