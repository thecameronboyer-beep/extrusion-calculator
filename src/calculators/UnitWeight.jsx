import { useMemo } from 'react';
import CalculatorCard from '../components/CalculatorCard.jsx';
import ModeToggle from '../components/ModeToggle.jsx';
import NumberInput from '../components/NumberInput.jsx';
import ResultRow from '../components/ResultRow.jsx';
import { calculateSingleUnitWeight, calculateSixSampleWeight } from '../utils/formulas.js';
import { formatNumber } from '../utils/formatters.js';
import { usePersistentState } from '../utils/usePersistentState.js';

const modes = [
  { id: 'sample', label: '6" Sample' },
  { id: 'single', label: 'Single Unit Grams' },
];

export default function UnitWeight() {
  const [mode, setMode] = usePersistentState(
    'extrusion-calculator:unit-weight:mode',
    'sample'
  );
  const [values, setValues] = usePersistentState('extrusion-calculator:unit-weight:values', {
    sampleGrams: '',
    cutLength: '',
    unitsPerContainer: '',
    singleUnitGrams: '',
  });

  const result = useMemo(() => {
    if (mode === 'sample') {
      return calculateSixSampleWeight(
        values.sampleGrams,
        values.cutLength,
        values.unitsPerContainer
      );
    }

    return calculateSingleUnitWeight(values.singleUnitGrams, values.unitsPerContainer);
  }, [mode, values]);

  function updateValue(key, nextValue) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  return (
    <CalculatorCard
      title="Unit Weight"
      summary="Use a 6-inch sample and cut length to calculate gram weight per unit."
      className="unit-weight-card"
      results={
        <div className="result-grid unit-weight-result-grid">
          {mode === 'sample' ? (
            <ResultRow
              label="Gram Weight Per Unit"
              value={result ? formatNumber(result.singleUnitGrams, { suffix: ' g' }) : '-'}
            />
          ) : null}
          {mode === 'sample' ? (
            <ResultRow
              label="Gram Weight/Foot"
              value={result ? formatNumber(result.gramWeightPerFoot, { suffix: ' g/ft' }) : '-'}
            />
          ) : null}
          <ResultRow
            label="Unit Weight Pounds"
            value={
              result
                ? formatNumber(result.singleUnitPounds, {
                    maximumFractionDigits: 4,
                    suffix: ' lb',
                  })
                : '-'
            }
            detail="453.592 grams per pound"
          />
          <ResultRow
            label="Container Weight"
            value={
              result
                ? formatNumber(result.containerWeightPounds, {
                    maximumFractionDigits: 2,
                    suffix: ' lb',
                  })
                : '-'
            }
          />
        </div>
      }
    >
      <div className="nested-mode">
        <ModeToggle options={modes} value={mode} onChange={setMode} />
      </div>
      {mode === 'sample' ? (
        <div className="maintain-gram-inputs">
          <div className="input-grid unit-weight-input-grid">
            <NumberInput
              label={'6" Sample Weight'}
              unit="g"
              value={values.sampleGrams}
              onChange={(nextValue) => updateValue('sampleGrams', nextValue)}
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
          </div>
        </div>
      ) : (
        <div className="maintain-gram-inputs">
          <div className="input-grid two-up-input-grid unit-weight-single-grid">
            <NumberInput
              label="Single Unit Grams"
              unit="g"
              value={values.singleUnitGrams}
              onChange={(nextValue) => updateValue('singleUnitGrams', nextValue)}
            />
            <NumberInput
              label="Units Per Container"
              value={values.unitsPerContainer}
              onChange={(nextValue) => updateValue('unitsPerContainer', nextValue)}
            />
          </div>
        </div>
      )}
    </CalculatorCard>
  );
}
