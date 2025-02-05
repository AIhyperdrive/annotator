import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Trash2, Edit2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface Annotation {
  id: string;
  text: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface AnnotationSidebarProps {
  annotations?: Annotation[];
  onEdit?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
  onExport?: () => void;
  onAnnotationHover?: (id: string | null) => void;
}

const AnnotationSidebar = ({
  annotations = [
    {
      id: "1",
      text: "Sample annotation 1",
      coordinates: { x: 100, y: 100, width: 200, height: 150 },
    },
    {
      id: "2",
      text: "Sample annotation 2",
      coordinates: { x: 300, y: 200, width: 150, height: 100 },
    },
  ],
  onEdit = () => {},
  onDelete = () => {},
  onExport = () => {},
  onAnnotationHover = () => {},
}: AnnotationSidebarProps) => {
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(
    null,
  );
  const [editText, setEditText] = useState("");

  const handleEdit = (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setEditText(annotation.text);
  };

  const handleSaveEdit = () => {
    if (editingAnnotation) {
      onEdit(editingAnnotation.id, editText);
      setEditingAnnotation(null);
    }
  };

  return (
    <div className="w-[500px] h-full bg-background border-l border-border p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Annotations</h2>
        <Button
          variant="outline"
          onClick={onExport}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {annotations.map((annotation) => (
            <Card
              key={annotation.id}
              className="p-4"
              onMouseEnter={() => onAnnotationHover(annotation.id)}
              onMouseLeave={() => onAnnotationHover(null)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Region {annotation.id}
                  </p>
                  <p className="text-foreground">{annotation.text}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(annotation)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(annotation.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog
        open={!!editingAnnotation}
        onOpenChange={() => setEditingAnnotation(null)}
      >
        <DialogContent
          className="sm:max-w-[425px]"
          aria-describedby="edit-annotation-description"
        >
          <DialogHeader>
            <DialogTitle>Edit Annotation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Enter annotation text"
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingAnnotation(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnotationSidebar;
