import React, { useState } from "react";
import ImageCanvas from "./ImageCanvas";
import AnnotationSidebar from "./AnnotationSidebar";
import ToolBar from "./ToolBar";

interface Point {
  x: number;
  y: number;
}

interface Region {
  id: string;
  type: "rectangle" | "polygon";
  coordinates: Point[];
  imageFile?: string;
}

interface Annotation {
  id: string;
  text: string;
  imageFile: string;
  type: "rectangle" | "polygon";
  coordinates: Point[];
  visible?: boolean;
}

const Home = () => {
  const [selectedTool, setSelectedTool] = useState<"rectangle" | "freeform">(
    "rectangle",
  );
  const [annotations, setAnnotations] = useState<Annotation[]>([
    {
      id: "1",
      text: "Sample annotation 1",
      type: "rectangle",
      coordinates: [
        { x: 100, y: 100 },
        { x: 300, y: 100 },
        { x: 300, y: 250 },
        { x: 100, y: 250 },
      ],
      imageFile: "example.jpg",
    },
    {
      id: "2",
      text: "Sample annotation 2",
      type: "rectangle",
      coordinates: [
        { x: 300, y: 200 },
        { x: 450, y: 200 },
        { x: 450, y: 300 },
        { x: 300, y: 300 },
      ],
      imageFile: "example.jpg",
    },
  ]);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(
    null,
  );

  const handleToggleVisibility = (id: string) => {
    setAnnotations(
      annotations.map((ann) =>
        ann.id === id
          ? { ...ann, visible: ann.visible === false ? true : false }
          : ann,
      ),
    );
  };

  const handleRegionSelect = (region: Region) => {
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      text: "New annotation",
      imageFile: region.imageFile || "",
      type: region.type,
      coordinates: region.coordinates,
    };
    setAnnotations([...annotations, newAnnotation]);
  };

  const handleAnnotationEdit = (id: string, text: string) => {
    setAnnotations(
      annotations.map((ann) => (ann.id === id ? { ...ann, text } : ann)),
    );
  };

  const handleAnnotationDelete = (id: string) => {
    setAnnotations(annotations.filter((ann) => ann.id !== id));
  };

  const handleExport = () => {
    const exportData = JSON.stringify(annotations, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "annotations.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ToolBar
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        onExport={handleExport}
        canUndo={false}
        canRedo={false}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <ImageCanvas
            onRegionSelect={handleRegionSelect}
            selectedRegions={annotations.map((ann) => ({
              id: ann.id,
              type: ann.type,
              coordinates: ann.coordinates,
              visible: ann.visible,
            }))}
            selectedTool={selectedTool}
          />
        </div>
        <AnnotationSidebar
          annotations={annotations}
          onEdit={handleAnnotationEdit}
          onDelete={handleAnnotationDelete}
          onExport={handleExport}
          onAnnotationHover={setHoveredAnnotation}
          onToggleVisibility={handleToggleVisibility}
        />
      </div>
    </div>
  );
};

export default Home;
