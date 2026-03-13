import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FlowNodeData } from "@/types/flow"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { CircleXIcon } from "lucide-react"

export function SingleSelect({label, items, saveValue, selectedNodeId}: {label: string, items: string[], saveValue: (id: string, data: Partial<FlowNodeData>) => void, selectedNodeId: string}) {

  return (
    <div className="flex flex-row items-center gap-2">
    <Select
      onValueChange={(value) => saveValue(selectedNodeId, { [label]: value })}
    >
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder="Select"/>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {items.map((item, index)=>(
            <SelectItem key={index} value={item}>{item}</SelectItem>
          ))}
          <SelectItem value={"none"}>{"none"}</SelectItem>  

        </SelectGroup>
      </SelectContent>
    </Select>
    </div>
  )
}
