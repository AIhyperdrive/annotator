import React from "react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Square, Pencil, Download, Send, ArrowRight } from "lucide-react";

interface ToolBarProps {
  onToolSelect?: (tool: "rectangle" | "freeform") => void;
  onSubmit?: () => void;
  onNext?: () => void;
  onExport?: () => void;
  selectedTool?: "rectangle" | "freeform";
}

const ToolBar = ({
  onToolSelect = () => {},
  onSubmit = () => {},
  onNext = () => {},
  onExport = () => {},
  selectedTool = "rectangle",
}: ToolBarProps) => {
  return (
    <div className="h-[60px] w-full bg-background border-b flex items-center px-4 gap-4">
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={selectedTool === "rectangle" ? "default" : "outline"}
                size="icon"
                onClick={() => onToolSelect("rectangle")}
              >
                <Square className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rectangle Selection</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={selectedTool === "freeform" ? "default" : "outline"}
                size="icon"
                onClick={() => onToolSelect("freeform")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Freeform Selection</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                onClick={onSubmit}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Submit
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Submit Annotations</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={onNext}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Next
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next Image</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="ml-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export Annotations</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ToolBar;
