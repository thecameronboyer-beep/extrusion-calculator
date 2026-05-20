import AppShell from './components/AppShell.jsx';
import GramWeight from './calculators/GramWeight.jsx';
import ContainerTiming from './calculators/ContainerTiming.jsx';
import UnitWeight from './calculators/UnitWeight.jsx';
import CutTimer from './calculators/CutTimer.jsx';
import { useState } from 'react';

const calculators = [
  { id: 'gram-weight', label: 'Gram Weight', Component: GramWeight },
  { id: 'container-timing', label: 'Production Rate', Component: ContainerTiming },
  { id: 'unit-weight', label: 'Unit Weight', Component: UnitWeight },
  { id: 'cut-timer', label: 'Cut Timer', Component: CutTimer },
];

export default function App() {
  const [activeCalculator, setActiveCalculator] = useState(calculators[0].id);
  const ActiveCalculator =
    calculators.find((calculator) => calculator.id === activeCalculator)?.Component ?? GramWeight;

  return (
    <AppShell
      calculators={calculators}
      activeCalculator={activeCalculator}
      onCalculatorChange={setActiveCalculator}
    >
      <ActiveCalculator />
    </AppShell>
  );
}
