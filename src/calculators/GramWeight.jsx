import { useMemo } from 'react';
import CalculatorCard from '../components/CalculatorCard.jsx';
import NumberInput from '../components/NumberInput.jsx';
import ResultRow from '../components/ResultRow.jsx';
import {
  calculateDesiredGramWeight,
  calculateGramWeightWithOutputChange,
  calculateMaintainGramWeight,
} from '../utils/formulas.js';
import { formatNumber } from '../utils/formatters.js';
import { usePersistentState } from '../utils/usePersistentState.js';

export default function GramWeight() {
  const [targetMode, setTargetMode] = usePersistentState(
    'extrusion-calculator:gram-weight:mode',
    'maintain'
  );
  const [values, setValues] = usePersistentState('extrusion-calculator:gram-weight:values', {
    currentGramWeight: '',
    currentRpm: '',
    currentLineSpeed: '',
    newLineSpeed: '',
    desiredGramWeight: '',
  });

  const targetResult = useMemo(
    () => calculateDesiredGramWeight(values, targetMode),
    [targetMode, values]
  );
  const maintainResult = useMemo(() => calculateMaintainGramWeight(values), [values]);
  const outputChangeResult = useMemo(
    () => calculateGramWeightWithOutputChange(values),
    [values]
  );

  function updateValue(key, nextValue) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  const isMaintainTarget = targetMode === 'maintain';
  const isOutputChangeTarget = targetMode === 'output-change';
  const needsCurrentRpm = targetMode !== 'line-speed';
  const needsCurrentLineSpeed = targetMode !== 'rpm';

  return (
    <CalculatorCard
      title="Gram Weight"
      summary="Solve the line speed or RPM needed to hit a desired gram weight."
      headerContent={
        <div className="gram-equation-tabs" aria-label="Gram weight modes">
          <button
            type="button"
            className={
              isOutputChangeTarget
                ? 'app-equation-header in-gram-card active'
                : 'app-equation-header in-gram-card'
            }
            aria-pressed={isOutputChangeTarget}
            onClick={() => setTargetMode('output-change')}
          >
            <span>
              <span className="delta-symbol">Δ</span> Gram Weight ∝ RPM / Line Speed
            </span>
          </button>

          <div className="gram-equation">
            <span className="equation-static-label">
              <span className="delta-symbol">Δ</span> Gram Weight
            </span>
            <div className="equation-fraction">
              <button
                type="button"
                className={targetMode === 'rpm' ? 'equation-tab active' : 'equation-tab'}
                onClick={() => setTargetMode('rpm')}
              >
                RPM
              </button>
              <button
                type="button"
                className={targetMode === 'line-speed' ? 'equation-tab active' : 'equation-tab'}
                onClick={() => setTargetMode('line-speed')}
              >
                Line Speed
              </button>
            </div>
          </div>
          <button
            type="button"
            className={
              targetMode === 'maintain' ? 'equation-tab combo-equation-tab active' : 'equation-tab combo-equation-tab'
            }
            onClick={() => setTargetMode('maintain')}
          >
            <span className="combo-delta-symbol">Δ</span>
            <span className="combo-fraction">
              <span>RPM</span>
              <span className="combo-fraction-line" aria-hidden="true" />
              <span>Line Speed</span>
            </span>
          </button>
        </div>
      }
      results={
        isOutputChangeTarget ? (
          <div className="result-grid">
            <ResultRow
              label="New RPM"
              value={outputChangeResult ? formatNumber(outputChangeResult.requiredRpm) : '-'}
            />
          </div>
        ) : isMaintainTarget ? (
          <div className="result-grid">
            <ResultRow
              label="New RPM"
              value={maintainResult ? formatNumber(maintainResult.requiredRpm) : '-'}
            />
          </div>
        ) : (
          <div className="result-grid">
            <ResultRow
              label={targetMode === 'rpm' ? 'New RPM' : 'New Line Speed'}
              value={targetResult ? formatNumber(targetResult.requiredValue) : '-'}
            />
          </div>
        )
      }
    >
      {isOutputChangeTarget ? (
        <div className="maintain-gram-inputs">
          <div className="input-grid two-up-input-grid">
            <NumberInput
              label="Current RPM"
              value={values.currentRpm}
              onChange={(nextValue) => updateValue('currentRpm', nextValue)}
            />
            <NumberInput
              label="Current Gram weight"
              unit="g"
              value={values.currentGramWeight}
              onChange={(nextValue) => updateValue('currentGramWeight', nextValue)}
            />
          </div>
          <div className="input-grid two-up-input-grid">
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
          </div>
          <div className="input-grid">
            <NumberInput
              label="Desired Gram weight"
              unit="g"
              value={values.desiredGramWeight}
              onChange={(nextValue) => updateValue('desiredGramWeight', nextValue)}
            />
          </div>
        </div>
      ) : isMaintainTarget ? (
        <div className="maintain-gram-inputs">
          <div className="input-grid two-up-input-grid">
            <NumberInput
              label="Current RPM"
              value={values.currentRpm}
              onChange={(nextValue) => updateValue('currentRpm', nextValue)}
            />
            <NumberInput
              label="Current Gram weight"
              unit="g"
              value={values.currentGramWeight}
              onChange={(nextValue) => updateValue('currentGramWeight', nextValue)}
            />
          </div>
          <div className="input-grid two-up-input-grid">
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
          </div>
        </div>
      ) : (
        <div className="input-grid gram-delta-input-grid">
          <NumberInput
            label="Current Gram weight"
            unit="g"
            value={values.currentGramWeight}
            onChange={(nextValue) => updateValue('currentGramWeight', nextValue)}
          />
          {needsCurrentRpm ? (
            <NumberInput
              label="Current RPM"
              value={values.currentRpm}
              onChange={(nextValue) => updateValue('currentRpm', nextValue)}
            />
          ) : null}
          {needsCurrentLineSpeed ? (
            <NumberInput
              label="Current Line Speed"
              unit="Feet/Min"
              value={values.currentLineSpeed}
              onChange={(nextValue) => updateValue('currentLineSpeed', nextValue)}
            />
          ) : null}
          <NumberInput
            label="Desired Gram weight"
            unit="g"
            value={values.desiredGramWeight}
            onChange={(nextValue) => updateValue('desiredGramWeight', nextValue)}
          />
        </div>
      )}
    </CalculatorCard>
  );
}
