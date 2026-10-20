/**
 * Desktop (Tauri): só teclado.
 * Celular (Capacitor): HUD de toque.
 * Web: HUD se o navegador expõe ontouchstart.
 */
export type Shell = 'desktop' | 'mobile' | 'web'

interface HostWindow extends Window {
  __TAURI_INTERNALS__?: unknown
  __TAURI__?: unknown
  Capacitor?: { isNativePlatform?: () => boolean }
}

export function detectShell(): Shell {
  const host = window as HostWindow
  if (host.__TAURI_INTERNALS__ || host.__TAURI__) return 'desktop'
  if (host.Capacitor?.isNativePlatform?.()) return 'mobile'
  return 'web'
}

export function wantsTouchHud(shell: Shell): boolean {
  if (shell === 'desktop') return false
  if (shell === 'mobile') return true
  return 'ontouchstart' in window
}
