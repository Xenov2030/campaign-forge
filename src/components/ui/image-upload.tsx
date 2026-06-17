"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import NextImage from "next/image";
import { X, Loader2, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  label?: string;
  aspectRatio?: "square" | "portrait" | "wide";
}

export function ImageUpload({
  value,
  onChange,
  folder = "general",
  className = "",
  label = "Subir imagen",
  aspectRatio = "square",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    wide: "aspect-video",
  }[aspectRatio];

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <div
        className={`relative ${aspectClass} rounded-[var(--radius-lg)] border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${dragOver
            ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/5"
            : "border-[var(--border-default)] hover:border-[var(--accent-gold)]/50 bg-[var(--bg-elevated)]"
          }`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        {value ? (
          <>
            <NextImage src={value} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="p-2 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-[var(--text-muted)]">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-gold)]" />
            ) : (
              <>
                <ImageIcon className="h-8 w-8 opacity-50" />
                <p className="text-xs font-medium">{label}</p>
                <p className="text-xs opacity-60">Arrastra o haz clic · JPG, PNG, WebP · máx. 8MB</p>
              </>
            )}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
