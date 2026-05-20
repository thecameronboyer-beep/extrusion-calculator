import AppShell from './components/AppShell.jsx';
import GramWeight from './calculators/GramWeight.jsx';
import ContainerTiming from './calculators/ContainerTiming.jsx';
import UnitWeight from './calculators/UnitWeight.jsx';
import CutTimer from './calculators/CutTimer.jsx';
import { useEffect, useRef, useState } from 'react';
import {
  getThemeToastMessage,
  readStoredTheme,
  THEME_STORAGE_KEY,
  THEMES,
} from './theme/theme.js';

const calculators = [
  { id: 'gram-weight', label: 'Gram Weight', Component: GramWeight },
  { id: 'container-timing', label: 'Production Rate', Component: ContainerTiming },
  { id: 'unit-weight', label: 'Unit Weight', Component: UnitWeight },
  { id: 'cut-timer', label: 'Cut Timer', Component: CutTimer },
];

export default function App() {
  const [activeCalculator, setActiveCalculator] = useState(calculators[0].id);
  const [theme, setTheme] = useState(readStoredTheme);
  const [themeToast, setThemeToast] = useState('');
  const toastTimerRef = useRef(null);
  const ActiveCalculator =
    calculators.find((calculator) => calculator.id === activeCalculator)?.Component ?? GramWeight;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    []
  );

  function toggleDolphinTheme() {
    setTheme((currentTheme) => {
      const nextTheme =
        currentTheme === THEMES.DOLPHIN ? THEMES.INDUSTRIAL : THEMES.DOLPHIN;

      setThemeToast(getThemeToastMessage(nextTheme));

      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }

      toastTimerRef.current = window.setTimeout(() => {
        setThemeToast('');
      }, 2200);

      return nextTheme;
    });
  }

  return (
    <AppShell
      calculators={calculators}
      activeCalculator={activeCalculator}
      onCalculatorChange={setActiveCalculator}
      themeToast={themeToast}
    >
      <ActiveCalculator onDolphinThemeToggle={toggleDolphinTheme} />
    </AppShell>
  );
}
