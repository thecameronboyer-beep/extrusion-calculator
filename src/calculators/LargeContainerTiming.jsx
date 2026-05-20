import { useMemo, useState } from 'react';
import CalculatorCard from '../components/CalculatorCard.jsx';
import NumberInput from '../components/NumberInput.jsx';
import ResultRow from '../components/ResultRow.jsx';
import { calculateLargeContainerTiming } from '../utils/formulas.js';
import { formatDuration, formatNumber } from '../utils/formatters.js';

export default function LargeContainerTiming() {
  const [values, setValues] = useState({
    lineSpeed: '30',
    cutLength: '18',
    unitsPerContainer: '1200',
    currentUnitsInContainer: '450',
  });

  const result = useMemo(() => calculateLargeContainerTiming(values), [values]);

  function updateValue(key, nextValue) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  return (
    <CalculatorCard
      title="Large Container Timing"
      summary="Estimate completion timing for a large container already in progress."
      results={
        <div className="result-grid">
          <ResultRow
            label="Units/hr"
            value={result ? formatNumber(result.unitsPerHour, { maximumFractionDigits: 1 }) : '-'}
          />
          <ResultRow
            label="Time Per Container"
            value={result ? formatDuration(result.timePerContainerHours) : '-'}
          />
          <ResultRow
            label="Units Remaining"
            value={result ? formatNumber(result.unitsRemaining, { maximumFractionDigits: 0 }) : '-'}
          />
          <ResultRow
            label="Time Until Container Is Complete"
            value={result ? formatDuration(result.timeUntilCompleteHours) : '-'}
          />
        </div>
      }
    >
      <div className="input-grid">
        <NumberInput
          label="Line Speed"
          unit="Feet/Min"
          value={values.lineSpeed}
          onChange={(nextValue) => updateValue('lineSpeed', nextValue)}
        />
        <NumberInput
          label="Cut Length"
          unit="inches"
          value={values.cutLength}
          onChange={(nextValue) => updateValue('cutLength', nextValue)}
        />
        <NumberInput
          label="Units Per Container"
          value={values.unitsPerContainer}
          onChange={(nextValue) => updateValue('unitsPerContainer', nextValue)}
        />
        <NumberInput
          label="Current Units In Container"
          value={values.currentUnitsInContainer}
          onChange={(nextValue) => updateValue('currentUnitsInContainer', nextValue)}
        />
      </div>
    </CalculatorCard>
  );
}
