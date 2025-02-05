import React, { useState } from "react";
import ImageCanvas from "./ImageCanvas";
import AnnotationSidebar from "./AnnotationSidebar";
import ToolBar from "./ToolBar";

interface Region {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Annotation {
  id: string;
  text: string;
  imageFile: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const Home = () => {
  const [selectedTool, setSelectedTool] = useState<"rectangle" | "freeform">(
    "rectangle",
  );
  const [annotations, setAnnotations] = useState<Annotation[]>([
    {
      id: "1",
      text: "Sample annotation 1",
      coordinates: { x: 100, y: 100, width: 200, height: 150 },
      imageFile: "example.jpg",
    },
    {
      id: "2",
      text: "Sample annotation 2",
      coordinates: { x: 300, y: 200, width: 150, height: 100 },
      imageFile: "example.jpg",
    },
  ]);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(
    null,
  );

  const handleRegionSelect = (region: Region) => {
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      text: "New annotation",
      imageFile: region.imageFile || "",
      coordinates: {
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height,
      },
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
              ...ann.coordinates,
            }))}
          />
        </div>
        <AnnotationSidebar
          annotations={annotations}
          onEdit={handleAnnotationEdit}
          onDelete={handleAnnotationDelete}
          onExport={handleExport}
          onAnnotationHover={setHoveredAnnotation}
        />
      </div>
    </div>
  );
};

export default Home;
