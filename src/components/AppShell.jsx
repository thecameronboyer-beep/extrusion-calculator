import ModeToggle from './ModeToggle.jsx';
import DolphinDecorations from './DolphinDecorations.jsx';
import ThemeToast from './ThemeToast.jsx';

export default function AppShell({
  calculators,
  activeCalculator,
  onCalculatorChange,
  children,
  themeToast,
}) {
  return (
    <div className="app-shell">
      <DolphinDecorations />
      <ThemeToast message={themeToast} />
      <main className="workbench">
        <aside className="mode-rail" aria-label="Calculator modes">
          <ModeToggle
            options={calculators}
            value={activeCalculator}
            onChange={onCalculatorChange}
          />
        </aside>

        <section className="calculator-stage">{children}</section>
      </main>
    </div>
  );
}
