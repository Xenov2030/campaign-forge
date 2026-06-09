"use client";

import { useState, useRef, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ImageIcon, Loader2, X, Check, ZoomIn } from "lucide-react";
import { toast } from "sonner";

type Aspect = "portrait" | "square" | "wide" | "banner";

const ASPECT_RATIO: Record<Aspect, number> = { portrait: 3 / 4, square: 1, wide: 16 / 6, banner: 4 / 1 };
const ASPECT_CLASS: Record<Aspect, string> = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  wide: "aspect-[16/6]",
  banner: "aspect-[4/1]",
};

// Recorta la imagen al área seleccionada (en píxeles) y devuelve un blob JPEG.
async function getCroppedBlob(src: string, area: Area): Promise<Blob | null> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  // Escalamos el recorte a un máximo razonable para no subir payloads enormes.
  const MAX = 1200;
  const scale = Math.min(1, MAX / Math.max(area.width, area.height));
  const w = Math.max(1, Math.round(area.width * scale));
  const h = Math.max(1, Math.round(area.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, w, h);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85));
}

interface ImageCropUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspect?: Aspect;
  className?: string;
}

export function ImageCropUpload({
  value,
  onChange,
  folder = "general",
  label = "Subir imagen",
  aspect = "square",
  className = "",
}: ImageCropUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = useCallback((_area: Area, areaPx: Area) => setAreaPixels(areaPx), []);

  const close = () => {
    setSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const confirm = async () => {
    if (!src || !areaPixels) return;
    setUploading(true);
    try {
      const blob = await getCroppedBlob(src, areaPixels);
      if (!blob) throw new Error("No se pudo procesar la imagen");
      const fd = new FormData();
      fd.append("file", new File([blob], "image.jpg", { type: "image/jpeg" }));
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.url);
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`relative w-full ${ASPECT_CLASS[aspect]} rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border-default)] hover:border-[var(--accent-gold)]/50 bg-[var(--bg-elevated)] overflow-hidden transition-colors cursor-pointer group`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <span className="text-xs text-white font-medium">Cambiar imagen</span>
            </div>
          </>
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--text-muted)] p-3 text-center">
            <ImageIcon className="h-7 w-7 opacity-50" />
            <span className="text-xs font-medium">{label}</span>
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            const reader = new FileReader();
            reader.onload = () => setSrc(reader.result as string);
            reader.readAsDataURL(f);
          }
          e.target.value = "";
        }}
      />

      {src && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] w-full max-w-lg overflow-hidden shadow-[var(--shadow-xl)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h3 className="font-display font-bold text-[var(--text-primary)]">Recortar y acomodar</h3>
              <button type="button" onClick={close} aria-label="Cancelar" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative w-full h-80 bg-black">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT_RATIO[aspect]}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <ZoomIn className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1 accent-[var(--accent-gold)] cursor-pointer"
                  aria-label="Zoom"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={close} className="h-9 px-4 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={uploading}
                  className="h-9 px-4 rounded-[var(--radius-md)] text-sm font-semibold bg-[var(--accent-gold)] text-black hover:brightness-110 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Usar imagen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
