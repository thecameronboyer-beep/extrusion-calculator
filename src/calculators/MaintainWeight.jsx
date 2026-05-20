import { useMemo, useState } from 'react';
import CalculatorCard from '../components/CalculatorCard.jsx';
import NumberInput from '../components/NumberInput.jsx';
import ResultRow from '../components/ResultRow.jsx';
import { calculateMaintainWeight } from '../utils/formulas.js';
import {
  formatDuration,
  formatNumber,
  formatPercent,
  formatSignedNumber,
  toneForDelta,
} from '../utils/formatters.js';

export default function MaintainWeight() {
  const [values, setValues] = useState({
    currentRpm: '42',
    currentLineSpeed: '28',
    newLineSpeed: '34',
    cutLength: '18',
    unitsPerContainer: '120',
    totalOrderUnits: '24000',
  });

  const result = useMemo(() => calculateMaintainWeight(values), [values]);
  const deltas = result?.deltas;

  function updateValue(key, nextValue) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  const productionReady = result?.currentProduction && result?.newProduction;
  const timeDelta = deltas?.orderTimeHours;

  return (
    <CalculatorCard
      title="Maintain Weight / Speed Change"
      summary="Find required RPM and compare production timing after a line speed change."
      results={
        <div className="result-grid wide-results">
          <ResultRow
            label="Required RPM"
            value={result ? formatNumber(result.requiredRpm, { maximumFractionDigits: 2 }) : '-'}
            detail="Current RPM x New Line Speed / Current Line Speed"
          />
          <ResultRow
            label="Throughput"
            value={deltas ? formatPercent(deltas.throughputPercent) : '-'}
            detail={
              deltas
                ? deltas.throughputPercent >= 0
                  ? 'throughput increase'
                  : 'throughput decrease'
                : 'Enter valid positive inputs'
            }
            tone={toneForDelta(deltas?.throughputPercent)}
          />
          <ResultRow
            label="Current Units/hr"
            value={
              productionReady
                ? formatNumber(result.currentProduction.unitsPerHour, {
                    maximumFractionDigits: 1,
                  })
                : '-'
            }
          />
          <ResultRow
            label="New Units/hr"
            value={
              productionReady
                ? formatNumber(result.newProduction.unitsPerHour, {
                    maximumFractionDigits: 1,
                  })
                : '-'
            }
          />
          <ResultRow
            label="Units/hr Change"
            value={
              deltas
                ? formatSignedNumber(deltas.unitsPerHour, {
                    maximumFractionDigits: 1,
                  })
                : '-'
            }
            detail={
              deltas
                ? deltas.unitsPerHour >= 0
                  ? 'units/hr increase'
                  : 'units/hr decrease'
                : null
            }
            tone={toneForDelta(deltas?.unitsPerHour)}
          />
          <ResultRow
            label="Current Containers/hr"
            value={
              productionReady
                ? formatNumber(result.currentProduction.containersPerHour, {
                    maximumFractionDigits: 2,
                  })
                : '-'
            }
          />
          <ResultRow
            label="New Containers/hr"
            value={
              productionReady
                ? formatNumber(result.newProduction.containersPerHour, {
                    maximumFractionDigits: 2,
                  })
                : '-'
            }
          />
          <ResultRow
            label="Containers/hr Change"
            value={
              deltas
                ? formatSignedNumber(deltas.containersPerHour, {
                    maximumFractionDigits: 2,
                  })
                : '-'
            }
            detail={
              deltas
                ? deltas.containersPerHour >= 0
                  ? 'containers/hr increase'
                  : 'containers/hr decrease'
                : null
            }
            tone={toneForDelta(deltas?.containersPerHour)}
          />
          <ResultRow
            label="Current Order Time"
            value={result?.currentOrderTimeHours ? formatDuration(result.currentOrderTimeHours) : '-'}
          />
          <ResultRow
            label="New Order Time"
            value={result?.newOrderTimeHours ? formatDuration(result.newOrderTimeHours) : '-'}
          />
          <ResultRow
            label="Order Time Change"
            value={Number.isFinite(timeDelta) ? formatDuration(Math.abs(timeDelta)) : '-'}
            detail={
              Number.isFinite(timeDelta)
                ? timeDelta >= 0
                  ? 'time saved'
                  : 'time added'
                : 'Total order units required'
            }
            tone={toneForDelta(timeDelta)}
          />
        </div>
      }
    >
      <div className="input-grid">
        <NumberInput
          label="Current RPM"
          value={values.currentRpm}
          onChange={(nextValue) => updateValue('currentRpm', nextValue)}
        />
        <NumberInput
          label="Current Line Speed"
          unit="Feet/Min"
          value={values.currentLineSpeed}
          onChange={(nextValue) => updateValue('currentLineSpeed', nextValue)}
        />
        <NumberInput
          label="New Line Speed"
          unit="Feet/Min"
          value={values.newLineSpeed}
          onChange={(nextValue) => updateValue('newLineSpeed', nextValue)}
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
          label="Total Order Units"
          value={values.totalOrderUnits}
          onChange={(nextValue) => updateValue('totalOrderUnits', nextValue)}
        />
      </div>
    </CalculatorCard>
  );
}
