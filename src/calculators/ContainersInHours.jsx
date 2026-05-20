import { useMemo, useState } from 'react';
import CalculatorCard from '../components/CalculatorCard.jsx';
import NumberInput from '../components/NumberInput.jsx';
import ResultRow from '../components/ResultRow.jsx';
import { calculateContainersInHours } from '../utils/formulas.js';
import { formatNumber } from '../utils/formatters.js';

export default function ContainersInHours() {
  const [values, setValues] = useState({
    lineSpeed: '30',
    cutLength: '18',
    unitsPerContainer: '120',
    hours: '2',
  });

  const result = useMemo(() => calculateContainersInHours(values), [values]);

  function updateValue(key, nextValue) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  return (
    <CalculatorCard
      title="Containers in Hours"
      summary="Estimate finished units and containers for a production window."
      results={
        <div className="result-grid">
          <ResultRow
            label="Units Produced"
            value={result ? formatNumber(result.unitsProduced, { maximumFractionDigits: 0 }) : '-'}
            detail="Line Speed x 60 / Cut Length x Hours"
          />
          <ResultRow
            label="Containers Produced"
            value={result ? formatNumber(result.containersProduced, { maximumFractionDigits: 2 }) : '-'}
            detail="Units Produced / Units Per Container"
          />
          <ResultRow
            label="Units/hr"
            value={result ? formatNumber(result.unitsPerHour, { maximumFractionDigits: 1 }) : '-'}
          />
          <ResultRow
            label="Containers/hr"
            value={result ? formatNumber(result.containersPerHour, { maximumFractionDigits: 2 }) : '-'}
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
          label="Hours"
          unit="hr"
          value={values.hours}
          onChange={(nextValue) => updateValue('hours', nextValue)}
        />
      </div>
    </CalculatorCard>
  );
}
