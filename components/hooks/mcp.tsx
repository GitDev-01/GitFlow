"use client";

import { useEffect, useState } from "react";

export function useMCP() {
  const [lastAction, setLastAction] = useState<{ type: string, data: any } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Connect to our internal event stream
    const eventSource = new EventSource("/api/events");

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("Connected to MCP Event Bus");
    };

    // 2. Listen for 'message' events from the server
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setLastAction({type: payload.type, data: payload.data});
        
        // Logic: Trigger specific UI changes based on action type
        console.log(`AI Triggered Action: ${payload.type}`, payload.data);
      } catch (err) {
        console.error("Failed to parse MCP event", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection failed:", err);
      setIsConnected(false);
      eventSource.close();
    };

    // 3. Cleanup: Close connection when component unmounts
    return () => {
      eventSource.close();
    };
  }, []);

  return { lastAction, isConnected };
}