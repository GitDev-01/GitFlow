import { Edge } from "@xyflow/react";

export const sortEdges = (edges: Edge[]) => {
    let hasStartNode = false 
    let prev = ""

    let sortedEdges: Edge[] = []

    for (let i = 0; i < edges.length; i++){
        edges.forEach((edge)=>{
            // Skip start node
            if (edge.source === "start" && !hasStartNode){
                hasStartNode = true
                prev = edge.target
            }

            if (edge.source === prev) {
                prev = edge.target
                sortedEdges.push(edge)
            }   
        }
    )}

    return sortedEdges
}