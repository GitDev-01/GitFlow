import { eventBus } from "@/lib/events";

export async function GET(req: Request) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Listen for the event emitted by the MCP tool
  const onUpdate = (event: any) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
  };

  eventBus.on('ui-push', onUpdate);

  // Use req.signal instead of pipeTo — no locking
  req.signal.addEventListener("abort", () => {
    eventBus.off("ui-push", onUpdate);
    writer.close();
  });

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}