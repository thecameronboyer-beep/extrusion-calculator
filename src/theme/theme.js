export const THEMES = {
  INDUSTRIAL: 'industrial',
  DOLPHIN: 'dolphin',
};

export const THEME_STORAGE_KEY = 'extrusion-calculator:theme';

export function readStoredTheme() {
  if (typeof window === 'undefined') {
    return THEMES.INDUSTRIAL;
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  return savedTheme === THEMES.DOLPHIN ? THEMES.DOLPHIN : THEMES.INDUSTRIAL;
}

export function getThemeToastMessage(theme) {
  return theme === THEMES.DOLPHIN
    ? 'Dolphin Mode Enabled 🐬'
    : 'Industrial Mode Enabled';
}
