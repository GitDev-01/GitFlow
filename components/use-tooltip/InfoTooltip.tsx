import React, { type JSX } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export const UseTooltip = ({trigger, text}: {trigger: JSX.Element, text: string}) => {
    return (
    <Tooltip>
        <TooltipTrigger>{trigger}</TooltipTrigger>
        <TooltipContent>
            {text}
        </TooltipContent>
    </Tooltip>
    )
}