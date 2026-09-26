


"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent, TouchEvent } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Eraser, PenLine, Upload } from "lucide-react";
import type { QuotationFormValues } from "../../types/quotation-form.types";

type Mode = "draw" | "upload";

export function QuotationSignatureSection({ compact = false }: { compact?: boolean }) {
  const { setValue } = useFormContext<QuotationFormValues>();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drewRef = useRef(false);

  const [mode, setMode] = useState<Mode>("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const clearAll = () => {
    clearCanvas();
    drewRef.current = false;
    setPreview(null);
    setValue("signature", null, { shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    clearAll();
    setMode(next);
  };

  const commitCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !drewRef.current) return;
    const data = canvas.toDataURL("image/png");
    setPreview(data);
    setValue("signature", data, { shouldDirty: true });
  };

  const getPosition = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    const clientY = "touches" in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    if (mode !== "draw") return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { x, y } = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    if (mode !== "draw" || !isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { x, y } = getPosition(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    drewRef.current = true;
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    commitCanvas();
  };

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearCanvas();
    drewRef.current = false;
    setMode("upload");

    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || "");
      setPreview(data);
      setValue("signature", data, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">Authorized signatory <span className="text-xs font-normal text-slate-400">(required to finalize)</span></p>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant={mode === "draw" ? "primary" : "outline"}
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => switchMode("draw")}
          >
            <PenLine className="h-3.5 w-3.5" />
            Draw
          </Button>
          <Button
            type="button"
            variant={mode === "upload" ? "primary" : "outline"}
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => {
              switchMode("upload");
              fileInputRef.current?.click();
            }}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            onClick={clearAll}
          >
            <Eraser className="h-3.5 w-3.5" />
            Clear
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUpload}
          />
        </div>
      </div>

      {mode === "draw" ? (
        <div className="overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
          <canvas
            ref={canvasRef}
            width={640}
            height={compact ? 120 : 160}
            className={`w-full touch-none cursor-crosshair ${compact ? "h-24 sm:h-28" : "h-32 sm:h-36"}`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
          />
        </div>
      ) : (
        <div className={`flex items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 ${compact ? "h-24 sm:h-28" : "h-32 sm:h-36"}`}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Signature"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <p className="text-sm text-slate-400">Upload a signature image</p>
          )}
        </div>
      )}
      <p className="mt-1 text-[11px] text-slate-400">
        Use draw or upload — only one at a time
      </p>
    </div>
  );
}