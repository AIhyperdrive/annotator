import React, { useRef, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Upload, Image as ImageIcon } from "lucide-react";

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

interface ImageCanvasProps {
  onRegionSelect?: (region: Region) => void;
  selectedRegions?: Region[];
  imageUrl?: string;
  selectedTool?: "rectangle" | "freeform";
}

const ImageCanvas = ({
  onRegionSelect = () => {},
  selectedRegions = [],
  imageUrl = "",
  selectedTool = "rectangle",
}: ImageCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [points, setPoints] = useState<Point[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          // Draw image immediately after it loads
          requestAnimationFrame(() => {
            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext("2d");
              if (ctx) {
                ctx.clearRect(
                  0,
                  0,
                  canvasRef.current.width,
                  canvasRef.current.height,
                );
                ctx.drawImage(
                  img,
                  0,
                  0,
                  canvasRef.current.width,
                  canvasRef.current.height,
                );
              }
            }
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      // Clear the input value so the same file can be selected again if needed
      event.target.value = "";
    }
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (image) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    // Draw polygon points and lines
    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach((point, index) => {
        if (index > 0) {
          ctx.lineTo(point.x, point.y);
        }
        // Draw point
        ctx.fillStyle = "#00ff00";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
      // Connect lines
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [points, image]);

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (selectedTool === "rectangle") {
        if (event.button === 0) {
          // Left click
          setIsDrawing(true);
          setStartPos({ x, y });
        }
      } else if (selectedTool === "freeform") {
        if (event.button === 0 && points.length < 10) {
          // Left click and under 10 points
          const newPoints = [...points, { x, y }];
          setPoints(newPoints);
          // Redraw canvas with new point
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#00ff00";
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            if (points.length > 0) {
              ctx.beginPath();
              ctx.moveTo(
                points[points.length - 1].x,
                points[points.length - 1].y,
              );
              ctx.lineTo(x, y);
              ctx.strokeStyle = "#00ff00";
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }
        } else if (event.button === 2 && points.length >= 3) {
          // Right click with at least 3 points
          // Close the polygon
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.beginPath();
            ctx.moveTo(
              points[points.length - 1].x,
              points[points.length - 1].y,
            );
            ctx.lineTo(points[0].x, points[0].y);
            ctx.strokeStyle = "#00ff00";
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Create polygon region with clockwise points
          const center = points.reduce(
            (acc, point) => ({
              x: acc.x + point.x / points.length,
              y: acc.y + point.y / points.length,
            }),
            { x: 0, y: 0 },
          );

          // Sort points clockwise
          const sortedPoints = [...points].sort((a, b) => {
            const angleA = Math.atan2(a.y - center.y, a.x - center.x);
            const angleB = Math.atan2(b.y - center.y, b.x - center.x);
            return angleA - angleB;
          });

          const newRegion = {
            id: Date.now().toString(),
            type: "polygon" as const,
            coordinates: sortedPoints,
            imageFile: imageFileName,
          };

          onRegionSelect(newRegion);
          setPoints([]);
          setIsDrawing(false);

          // Redraw canvas to clear the polygon
          redrawCanvas();
        }
      }
    },
    [selectedTool, points, imageFileName, onRegionSelect, redrawCanvas],
  );

  const draw = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;
      if (selectedTool === "rectangle" && !isDrawing) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;

      // Redraw the image and existing points
      redrawCanvas();

      if (selectedTool === "rectangle" && isDrawing) {
        // Draw the selection rectangle
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          startPos.x,
          startPos.y,
          currentX - startPos.x,
          currentY - startPos.y,
        );
      } else if (selectedTool === "freeform" && points.length > 0) {
        // Draw line from last point to current mouse position
        ctx.beginPath();
        ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    },
    [isDrawing, startPos, points, selectedTool, redrawCanvas],
  );

  const stopDrawing = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !canvasRef.current || selectedTool !== "rectangle")
        return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;

      const newRegion = {
        id: Date.now().toString(),
        type: "rectangle" as const,
        coordinates: [
          {
            x: Math.min(startPos.x, currentX),
            y: Math.min(startPos.y, currentY),
          },
          {
            x: Math.max(startPos.x, currentX),
            y: Math.min(startPos.y, currentY),
          },
          {
            x: Math.max(startPos.x, currentX),
            y: Math.max(startPos.y, currentY),
          },
          {
            x: Math.min(startPos.x, currentX),
            y: Math.max(startPos.y, currentY),
          },
        ],
        imageFile: imageFileName,
      };

      onRegionSelect(newRegion);
      setIsDrawing(false);
    },
    [isDrawing, startPos, imageFileName, onRegionSelect, selectedTool],
  );

  // Effect to draw image when canvas or image changes
  React.useEffect(() => {
    if (image && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(
          image,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height,
        );
      }
    }
  }, [image]);

  return (
    <Card className="p-4 bg-white w-full h-full flex flex-col items-center justify-center">
      {!image && (
        <div className="flex flex-col items-center justify-center p-8">
          <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
          <div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              onClick={() => document.getElementById("image-upload")?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </Button>
          </div>
        </div>
      )}
      {image && (
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-gray-200 cursor-crosshair"
          onMouseDown={handleCanvasClick}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={() => setIsDrawing(false)}
          onContextMenu={(e) => {
            e.preventDefault();
            handleCanvasClick(e);
          }}
        />
      )}
    </Card>
  );
};

export default ImageCanvas;
