// Traduce los errores crudos de Gemini a mensajes cortos y claros para la UI.
// Nunca expone el error técnico del proveedor al usuario final.
export function friendlyAiError(error: unknown): { error: string; status: number } {
  const raw = error instanceof Error ? error.message : String(error);
  if (/429|too many requests|quota|rate.?limit/i.test(raw)) {
    return {
      error: "Alcanzaste el límite de uso de la IA por ahora. Esperá unos segundos e intentá de nuevo (o revisá tu plan de Gemini).",
      status: 429,
    };
  }
  if (/503|overloaded|unavailable/i.test(raw)) {
    return { error: "El servicio de IA está sobrecargado. Probá de nuevo en unos segundos.", status: 503 };
  }
  if (/api[_ ]?key|invalid.*key|permission|401|403/i.test(raw)) {
    return { error: "La API key de Gemini no es válida o no tiene permisos. Revisá tu configuración.", status: 502 };
  }
  return { error: "No se pudo generar el contenido. Intentá de nuevo.", status: 500 };
}
