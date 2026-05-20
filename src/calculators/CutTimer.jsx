import { useMemo } from 'react';
import CalculatorCard from '../components/CalculatorCard.jsx';
import NumberInput from '../components/NumberInput.jsx';
import ResultRow from '../components/ResultRow.jsx';
import { calculateCutTimer } from '../utils/formulas.js';
import { formatNumber } from '../utils/formatters.js';
import { usePersistentState } from '../utils/usePersistentState.js';

export default function CutTimer() {
  const [values, setValues] = usePersistentState('extrusion-calculator:cut-timer:values', {
    currentCutLength: '',
    currentTimer: '',
    desiredCutLength: '',
  });

  const result = useMemo(() => calculateCutTimer(values), [values]);

  function updateValue(key, nextValue) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  return (
    <CalculatorCard
      title="Cut Timer"
      summary="Adjust the cut timer for a new desired cut length."
      results={
        <div className="result-grid">
          <ResultRow
            label="New Timer"
            value={result ? formatNumber(result.newTimer, { maximumFractionDigits: 3 }) : '-'}
            detail="Current Timer x Desired Cut Length / Current Cut Length"
          />
        </div>
      }
    >
      <div className="input-grid">
        <NumberInput
          label="Current Cut Length"
          unit="inches"
          value={values.currentCutLength}
          onChange={(nextValue) => updateValue('currentCutLength', nextValue)}
        />
        <NumberInput
          label="Current Timer"
          value={values.currentTimer}
          onChange={(nextValue) => updateValue('currentTimer', nextValue)}
        />
        <NumberInput
          label="Desired Cut Length"
          unit="inches"
          value={values.desiredCutLength}
          onChange={(nextValue) => updateValue('desiredCutLength', nextValue)}
        />
      </div>
    </CalculatorCard>
  );
}
