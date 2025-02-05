import React, { useRef, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Upload, Image as ImageIcon } from "lucide-react";

interface Region {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCanvasProps {
  onRegionSelect?: (region: Region) => void;
  selectedRegions?: Region[];
  imageUrl?: string;
}

const ImageCanvas = ({
  onRegionSelect = () => {},
  selectedRegions = [],
  imageUrl = "",
}: ImageCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
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
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const startDrawing = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setIsDrawing(true);
      setStartPos({ x, y });
    },
    [],
  );

  const draw = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;

      // Redraw the image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (image) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      }

      // Draw the selection rectangle
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        startPos.x,
        startPos.y,
        currentX - startPos.x,
        currentY - startPos.y,
      );
    },
    [isDrawing, startPos, image],
  );

  const stopDrawing = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;

      const newRegion = {
        id: Date.now().toString(),
        x: Math.min(startPos.x, currentX),
        y: Math.min(startPos.y, currentY),
        width: Math.abs(currentX - startPos.x),
        height: Math.abs(currentY - startPos.y),
      };

      onRegionSelect(newRegion);
      setIsDrawing(false);
    },
    [isDrawing, startPos, onRegionSelect],
  );

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
              asChild
            >
              <label
                htmlFor="image-upload"
                className="flex items-center cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </label>
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
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={() => setIsDrawing(false)}
        />
      )}
    </Card>
  );
};

export default ImageCanvas;
