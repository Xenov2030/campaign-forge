"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCampaignStore } from "@/store/campaign-store";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MasterAssistantProps {
  campaignId: string;
  campaignName: string;
  campaignTheme: string;
}

export function MasterAssistant({
  campaignId,
  campaignName,
  campaignTheme,
}: MasterAssistantProps) {
  const { aiAssistantOpen, setAIAssistantOpen } = useCampaignStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `¡Saludos, Máster! Soy tu asistente para la campaña **${campaignName}**. Puedo ayudarte con ideas narrativas, mecánicas, PNJs, encuentros, y cualquier cosa que necesites para tu partida. ¿En qué puedo ayudarte?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          question: trimmed,
          history,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response ?? "No pude procesar tu pregunta.",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error al conectar con el asistente. Verifica tu API key.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!aiAssistantOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-96 bg-[var(--bg-surface)] border-l border-[var(--border-default)] z-40 flex flex-col shadow-[var(--shadow-xl)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-[var(--radius-sm)] bg-[var(--accent-arcane)]/20 border border-[var(--accent-arcane)]/30 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-[var(--accent-arcane)]" />
            </div>
            <div>
              <p className="text-sm font-display font-semibold text-[var(--text-primary)]">Asistente del Máster</p>
              <p className="text-xs text-[var(--text-muted)]">Powered by GPT-4o</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMessages(messages.slice(0, 1))}
              title="Limpiar conversación"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setAIAssistantOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold",
                  message.role === "assistant"
                    ? "bg-[var(--accent-arcane)]/20 text-[var(--accent-arcane)]"
                    : "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]"
                )}
              >
                {message.role === "assistant" ? "IA" : "TÚ"}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-[var(--radius-lg)] px-4 py-3 text-sm",
                  message.role === "assistant"
                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                    : "bg-[var(--accent-arcane)]/15 text-[var(--text-primary)] border border-[var(--accent-arcane)]/20"
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-[var(--accent-arcane)]/20 flex items-center justify-center">
                <Loader2 className="h-3 w-3 text-[var(--accent-arcane)] animate-spin" />
              </div>
              <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[var(--accent-arcane)]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta al asistente..."
              rows={2}
              className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-arcane)] resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              variant="arcane"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 text-center">
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
