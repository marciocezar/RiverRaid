// Decide quais controles aparecem. Regra da especificação:
//  - desktop (Mac e Windows): só teclado;
//  - mobile (Android e iOS): HUD de toque sempre;
//  - web: HUD de toque só quando o navegador aceita toque.
export type Plataforma = "desktop" | "mobile" | "web";

const declarada = import.meta.env.VITE_PLATFORM as Plataforma | undefined;

export const PLATAFORMA: Plataforma = declarada ?? "web";

export function temToque(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function usarHudToque(): boolean {
  if (PLATAFORMA === "mobile") return true;
  if (PLATAFORMA === "desktop") return false;
  return temToque();
}
