"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon, Plus, X, Loader2, Trash2, ZoomIn, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirmStore } from "@/store/confirm-store";

interface VisualAid {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
  isPublic: boolean;
  createdAt: string;
  user: { displayName: string };
}

interface ModalProps {
  aid: VisualAid;
  onClose: () => void;
}

function ImageModal({ aid, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display font-bold text-white text-lg">{aid.name}</h3>
            {aid.description && <p className="text-sm text-gray-400">{aid.description}</p>}
            <p className="text-xs text-gray-500 mt-0.5">Subido por {aid.user.displayName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ml-4">
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={aid.imageUrl} alt={aid.name} className="max-h-[75vh] object-contain rounded-[var(--radius-lg)]" />
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const params = useParams();
  const slug = params.campaignSlug as string;
  const confirm = useConfirmStore((s) => s.confirm);

  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [aids, setAids] = useState<VisualAid[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<VisualAid | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({ name: "", description: "", isPublic: true });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/campaigns/by-slug/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.id) setCampaignId(d.id);
      });
  }, [slug]);

  const loadAids = useCallback(async () => {
    if (!campaignId) return;
    try {
      const r = await fetch(`/api/gallery?campaignId=${campaignId}`);
      const d = await r.json();
      setAids(d.aids ?? []);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => { loadAids(); }, [loadAids]);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
    if (!form.name) setForm((p) => ({ ...p, name: f.name.replace(/\.[^.]+$/, "") }));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !campaignId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", `gallery/${campaignId}`);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error);

      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, imageUrl: upData.url, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAids((p) => [data.aid, ...p]);
      setShowForm(false);
      setFile(null);
      setPreview(null);
      setForm({ name: "", description: "", isPublic: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar ayuda visual",
      description: "¿Seguro que querés eliminar esta imagen? No se puede deshacer.",
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!ok) return;
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    setAids((p) => p.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)] mb-1">Galería de imágenes</h1>
          <p className="text-sm text-[var(--text-muted)]">Ayudas visuales compartidas con el grupo</p>
        </div>
        <label
          className="inline-flex items-center gap-2 h-10 px-4 bg-[var(--accent-gold)] text-[var(--bg-base)] font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all shadow-[var(--glow-gold)] text-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Subir imagen
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
      </div>

      {/* Upload form modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 w-full max-w-lg shadow-[var(--shadow-xl)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Subir ayuda visual</h2>
              <button onClick={() => { setShowForm(false); setFile(null); setPreview(null); }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="w-full h-48 object-cover rounded-[var(--radius-lg)] mb-4" />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nombre"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Mapa del castillo, Referencia de armadura..."
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Descripción (opcional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Contexto o notas sobre esta imagen..."
                  rows={2}
                  className="bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] px-3 py-2 rounded-[var(--radius-md)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors resize-none"
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={form.isPublic}
                  onChange={(e) => setForm((p) => ({ ...p, isPublic: e.target.checked }))}
                  className="h-4 w-4 accent-[var(--accent-gold)]"
                />
                <label htmlFor="isPublic" className="text-sm text-[var(--text-primary)] cursor-pointer">
                  Visible para todos los jugadores
                </label>
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                {uploading ? "Subiendo..." : "Subir a la galería"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`mb-6 border-2 border-dashed rounded-[var(--radius-xl)] p-8 text-center transition-all ${
          dragOver ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/5" : "border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        <ImageIcon className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2" />
        <p className="text-sm text-[var(--text-muted)]">Arrastra imágenes aquí para subirlas rápidamente</p>
        <p className="text-xs text-[var(--text-muted)]/60 mt-1">JPG, PNG, WebP · máx. 8MB</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-gold)]" />
        </div>
      ) : aids.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
          <p className="text-[var(--text-secondary)] font-medium">No hay imágenes en la galería</p>
          <p className="text-sm text-[var(--text-muted)]">Sube la primera ayuda visual usando el botón de arriba</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {aids.map((aid) => (
            <div key={aid.id} className="group relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden hover:border-[var(--border-default)] transition-all">
              <div className="aspect-square overflow-hidden cursor-pointer" onClick={() => setSelected(aid)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={aid.imageUrl} alt={aid.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
                <div className="flex justify-end gap-1.5 pointer-events-auto">
                  <button
                    onClick={() => setSelected(aid)}
                    className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(aid.id)}
                    className="p-1.5 rounded-full bg-black/50 text-red-400 hover:bg-red-900/70 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="pointer-events-none">
                  {!aid.isPublic && (
                    <div className="flex items-center gap-1 text-xs text-yellow-400 mb-1">
                      <EyeOff className="h-3 w-3" />
                      Solo máster
                    </div>
                  )}
                  <p className="text-white text-xs font-medium truncate">{aid.name}</p>
                  <p className="text-gray-400 text-xs truncate">{aid.user.displayName}</p>
                </div>
              </div>
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-[var(--text-primary)] truncate">{aid.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{aid.user.displayName}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && <ImageModal aid={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
