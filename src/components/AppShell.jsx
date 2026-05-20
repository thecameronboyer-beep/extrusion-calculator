import ModeToggle from './ModeToggle.jsx';

export default function AppShell({ calculators, activeCalculator, onCalculatorChange, children }) {
  return (
    <div className="app-shell">
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
