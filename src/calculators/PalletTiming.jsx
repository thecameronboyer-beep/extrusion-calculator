import { useMemo, useState } from 'react';
import CalculatorCard from '../components/CalculatorCard.jsx';
import NumberInput from '../components/NumberInput.jsx';
import ResultRow from '../components/ResultRow.jsx';
import { calculatePalletTiming } from '../utils/formulas.js';
import { formatDuration, formatNumber } from '../utils/formatters.js';

export default function PalletTiming() {
  const [values, setValues] = useState({
    lineSpeed: '30',
    cutLength: '18',
    unitsPerContainer: '120',
    containersPerPallet: '40',
    currentContainerNumber: '12',
    totalContainersOnPallet: '40',
  });

  const result = useMemo(() => calculatePalletTiming(values), [values]);

  function updateValue(key, nextValue) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  return (
    <CalculatorCard
      title="Pallet Timing"
      summary="Track container pace, full pallet timing, and remaining time on the current pallet."
      results={
        <div className="result-grid">
          <ResultRow
            label="Units/hr"
            value={result ? formatNumber(result.unitsPerHour, { maximumFractionDigits: 1 }) : '-'}
          />
          <ResultRow
            label="Containers/hr"
            value={result ? formatNumber(result.containersPerHour, { maximumFractionDigits: 2 }) : '-'}
          />
          <ResultRow
            label="Time Per Container"
            value={result ? formatDuration(result.timePerContainerHours) : '-'}
          />
          <ResultRow
            label="Time Per Pallet"
            value={result ? formatDuration(result.timePerPalletHours) : '-'}
          />
          <ResultRow
            label="Containers Remaining"
            value={result ? formatNumber(result.containersRemaining, { maximumFractionDigits: 0 }) : '-'}
          />
          <ResultRow
            label="Time Remaining On Current Pallet"
            value={result ? formatDuration(result.timeRemainingHours) : '-'}
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
          label="Containers Per Pallet"
          value={values.containersPerPallet}
          onChange={(nextValue) => updateValue('containersPerPallet', nextValue)}
        />
        <NumberInput
          label="Current Container Number"
          value={values.currentContainerNumber}
          onChange={(nextValue) => updateValue('currentContainerNumber', nextValue)}
        />
        <NumberInput
          label="Total Containers On Pallet"
          value={values.totalContainersOnPallet}
          onChange={(nextValue) => updateValue('totalContainersOnPallet', nextValue)}
        />
      </div>
    </CalculatorCard>
  );
}
