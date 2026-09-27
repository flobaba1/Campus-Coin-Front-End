export const THEME_KEY = 'campuscoin.theme'
export function getThemePreference(){const saved=localStorage.getItem(THEME_KEY);return ['light','dark','system'].includes(saved)?saved:'system'}
export function getSystemTheme(){return window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light'}
export function resolveTheme(preference=getThemePreference()){return preference==='system'?getSystemTheme():preference}
export function applyThemePreference(preference){const resolved=resolveTheme(preference);document.documentElement.dataset.theme=resolved;document.documentElement.dataset.themePreference=preference;document.documentElement.style.colorScheme=resolved;return resolved}
export function setThemePreference(preference){localStorage.setItem(THEME_KEY,preference);applyThemePreference(preference);window.dispatchEvent(new CustomEvent('campuscoin-theme-change',{detail:{preference}}))}
