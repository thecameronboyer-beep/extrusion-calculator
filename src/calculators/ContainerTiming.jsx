import { useEffect, useMemo, useState } from 'react';
import CalculatorCard from '../components/CalculatorCard.jsx';
import NumberInput from '../components/NumberInput.jsx';
import {
  calculateActiveContainerProgressTiming,
  calculateProduction,
} from '../utils/formulas.js';
import {
  formatCompletionTime,
  formatDuration,
  formatNumber,
  formatSignedNumber,
} from '../utils/formatters.js';
import { usePersistentState } from '../utils/usePersistentState.js';

function toneForChange(change, positiveWhenHigher = true) {
  if (!Number.isFinite(change) || change === 0) {
    return 'neutral';
  }

  const isPositive = positiveWhenHigher ? change > 0 : change < 0;
  return isPositive ? 'positive' : 'negative';
}

function formatTimeImpact(baselineHours, proposedHours) {
  if (!Number.isFinite(baselineHours) || !Number.isFinite(proposedHours)) {
    return null;
  }

  const savedHours = baselineHours - proposedHours;
  const absoluteSavedHours = Math.abs(savedHours);

  if (savedHours === 0) {
    return { detail: 'no change', tone: 'neutral' };
  }

  const impactAmount =
    absoluteSavedHours < 1 / 60
      ? formatSecondsDuration(absoluteSavedHours)
      : formatDuration(absoluteSavedHours);

  return {
    detail: `Δ ${impactAmount} ${savedHours > 0 ? 'saved' : 'added'}`,
    tone: savedHours > 0 ? 'positive' : 'negative',
  };
}

function metricComparison({
  baselineValue,
  proposedValue,
  format,
  positiveWhenHigher = true,
  detailOptions = {},
}) {
  if (!Number.isFinite(baselineValue) || !Number.isFinite(proposedValue)) {
    return null;
  }

  const change = proposedValue - baselineValue;

  return {
    label: '',
    value: format(proposedValue),
    detail:
      change === 0
        ? 'no change'
        : `Δ ${formatSignedNumber(change, detailOptions)}`,
    tone: toneForChange(change, positiveWhenHigher),
  };
}

function timeComparison(baselineHours, proposedHours) {
  const impact = formatTimeImpact(baselineHours, proposedHours);

  if (!impact) {
    return null;
  }

  return {
    label: '',
    value: formatDuration(proposedHours),
    detail: impact.detail,
    tone: impact.tone,
  };
}

function timePerContainerComparison(baselineHours, proposedHours) {
  const impact = formatTimeImpact(baselineHours, proposedHours);

  if (!impact) {
    return null;
  }

  const proposedMetric = formatTimePerContainerMetric(proposedHours);

  return {
    label: '',
    value: proposedMetric.value,
    detail: impact.detail,
    tone: impact.tone,
  };
}

function orderMetric(progress, currentTime, remainingLabel, completionLabel) {
  if (!progress) {
    return {
      label: completionLabel,
      value: '-',
      remainingTimeHours: null,
      isLong: false,
    };
  }

  const isLong = progress.remainingTimeHours > 24;

  return {
    label: isLong ? remainingLabel : completionLabel,
    value: isLong
      ? formatDuration(progress.remainingTimeHours)
      : formatCompletionTime(progress.remainingTimeHours, currentTime),
    remainingTimeHours: progress.remainingTimeHours,
    isLong,
  };
}

function orderComparison({
  baselineProgress,
  proposedProgress,
  currentTime,
  remainingLabel,
  completionLabel,
}) {
  if (!baselineProgress || !proposedProgress) {
    return null;
  }

  const proposedMetric = orderMetric(
    proposedProgress,
    currentTime,
    remainingLabel,
    completionLabel
  );
  const impact = formatTimeImpact(
    baselineProgress.remainingTimeHours,
    proposedProgress.remainingTimeHours
  );

  if (!impact) {
    return null;
  }

  return {
    label: proposedMetric.label.replace(' On Order', ''),
    value: proposedMetric.value,
    detail: impact.detail,
    tone: impact.tone,
  };
}

function formatTimePerContainerMetric(hoursValue) {
  if (!Number.isFinite(hoursValue)) {
    return { value: '-', unit: 'Minutes / Hours' };
  }

  const sign = hoursValue < 0 ? '-' : '';
  const hours = Math.abs(hoursValue);

  if (hours < 1) {
    return {
      value: `${sign}${formatNumber(hours * 60, {
        maximumFractionDigits: hours < 1 / 60 ? 2 : 1,
      })}`,
      unit: 'Minutes',
    };
  }

  return {
    value: `${sign}${formatNumber(hours, { maximumFractionDigits: 2 })}`,
    unit: 'Hours',
  };
}

function formatSecondsDuration(hoursValue) {
  const seconds = Math.max(1, Math.round(Math.abs(hoursValue) * 3600));
  return `${formatNumber(seconds, { maximumFractionDigits: 0 })} ${
    seconds === 1 ? 'second' : 'seconds'
  }`;
}

function MetricCard({
  label,
  value,
  unit,
  detail,
  priority = 'medium',
  comparison,
  comparisonPosition = 'below',
}) {
  const comparisonElement =
    comparison || comparisonPosition === 'above' ? (
      <span
        className={`metric-delta ${
          comparison ? comparison.tone : 'placeholder'
        }`}
        aria-hidden={comparison ? undefined : 'true'}
      >
        {comparison?.label ? (
          <span className="metric-delta-label">{comparison.label}</span>
        ) : null}
        <strong className="metric-delta-value">{comparison?.value ?? '0'}</strong>
        {comparison?.unit ? (
          <span className="metric-delta-unit">{comparison.unit}</span>
        ) : null}
        <span className="metric-delta-detail">
          {comparison?.detail ?? 'reserved'}
        </span>
      </span>
    ) : null;

  return (
    <div
      className={`production-metric ${priority} ${
        comparisonPosition === 'above' ? 'comparison-above' : ''
      }`}
    >
      <span className="production-metric-label">
        <span>{label}</span>
        {unit ? <span className="production-metric-unit">{unit}</span> : null}
      </span>
      {comparisonPosition === 'above' ? comparisonElement : null}
      <strong className="production-metric-value">{value}</strong>
      {comparisonPosition === 'below' ? comparisonElement : null}
      {detail ? <span className="production-metric-detail">{detail}</span> : null}
    </div>
  );
}

function ProductionLineSpeedInput({
  value,
  onChange,
  isDeltaActive,
  baselineValue,
  onStartDelta,
  onBack,
  onResnap,
}) {
  return (
    <div className={`number-field production-line-speed-field ${isDeltaActive ? 'delta-active' : ''}`}>
      <div className="number-label production-line-speed-label">
        <label htmlFor="production-line-speed">Line Speed</label>
        <span className="number-unit">Feet/Min</span>
      </div>
      <div className={isDeltaActive ? 'line-speed-delta-actions' : 'line-speed-delta-actions placeholder'}>
        <button
          type="button"
          onClick={onResnap}
          disabled={!isDeltaActive}
          aria-label="Snap current values as baseline"
          title="Snap baseline"
        >
          ↻
        </button>
      </div>
      <div className="production-line-speed-control">
        <input
          id="production-line-speed"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className={isDeltaActive ? 'line-speed-delta-button active' : 'line-speed-delta-button'}
          onClick={isDeltaActive ? onBack : onStartDelta}
          aria-label={isDeltaActive ? 'Back to snapped line speed' : 'Snapshot line speed delta'}
        >
          Δ
        </button>
      </div>
    </div>
  );
}

function ProgressTracker({
  title,
  currentLabel,
  totalLabel,
  currentValue,
  totalValue,
  onCurrentChange,
  onTotalChange,
  progress,
  comparisonProgress,
  remainingLabel,
  totalTimeLabel,
  completionLabel,
  currentTime,
  priority = 'primary',
  isPartialActive = false,
  partialUnitsValue,
  onPartialUnitsChange,
  onTogglePartial,
  isLocked = false,
}) {
  const isOrderPriority = priority === 'primary';
  const currentOrderMetric = orderMetric(progress, currentTime, remainingLabel, completionLabel);
  const percentValue = progress ? progress.percentComplete * 100 : 0;
  const safePercent = Math.min(Math.max(percentValue, 0), 100);
  const percentText = progress
    ? formatNumber(safePercent, { maximumFractionDigits: 0, suffix: '% Complete' })
    : '-';
  const remainingTime = progress ? formatDuration(progress.remainingTimeHours) : '-';

  return (
    <section className={`production-progress-panel ${priority}`}>
      <div className="production-section-heading">
        <span>{title}</span>
      </div>

      <div className="progress-entry">
        <div className="progress-count-line">
          <input
            aria-label={currentLabel}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={currentValue}
            disabled={isLocked}
            onChange={(event) => onCurrentChange(event.target.value)}
          />
          <span className="progress-of-label">of</span>
          <input
            aria-label={totalLabel}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={totalValue}
            disabled={isLocked}
            onChange={(event) => onTotalChange(event.target.value)}
          />
          <span className="progress-container-label">Containers</span>
        </div>
        {isOrderPriority ? (
          <div className={`progress-partial-row ${isPartialActive ? 'active' : ''}`}>
            <button type="button" onClick={onTogglePartial} disabled={isLocked}>
              Partial Progress
            </button>
            {isPartialActive ? (
              <label>
                <span>Units</span>
                <input
                  aria-label="Units In Current Order Container"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={partialUnitsValue}
                  disabled={isLocked}
                  onChange={(event) => onPartialUnitsChange(event.target.value)}
                />
              </label>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        className="progress-bar"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(safePercent)}
      >
        <span style={{ width: `${safePercent}%` }} />
      </div>
      <div className={isOrderPriority ? 'progress-meta split' : 'progress-meta'}>
        <span>{percentText}</span>
        {isOrderPriority && !currentOrderMetric.isLong ? (
          <span className="progress-remaining-inline">Time Remaining {remainingTime}</span>
        ) : null}
      </div>

      <div className="progress-timing-grid">
        {isOrderPriority ? null : (
          <>
            <MetricCard
              label={remainingLabel}
              value={remainingTime}
              priority="secondary"
              comparison={timeComparison(
                progress?.remainingTimeHours,
                comparisonProgress?.remainingTimeHours
              )}
            />
            <MetricCard
              label={totalTimeLabel}
              value={progress ? formatDuration(progress.totalTimeHours) : '-'}
              priority="small"
              comparison={timeComparison(
                progress?.totalTimeHours,
                comparisonProgress?.totalTimeHours
              )}
            />
          </>
        )}
        <MetricCard
          label={currentOrderMetric.label}
          value={currentOrderMetric.value}
          priority={isOrderPriority ? 'completion hero-completion' : 'completion'}
          comparisonPosition={isOrderPriority ? 'above' : 'below'}
          comparison={
            isOrderPriority
              ? orderComparison({
                  baselineProgress: progress,
                  proposedProgress: comparisonProgress,
                  currentTime,
                  remainingLabel,
                  completionLabel,
                })
              : orderComparison({
                  baselineProgress: progress,
                  proposedProgress: comparisonProgress,
                  currentTime,
                  remainingLabel,
                  completionLabel,
                }) || timeComparison(progress?.remainingTimeHours, comparisonProgress?.remainingTimeHours)
          }
        />
      </div>
    </section>
  );
}

export default function ContainerTiming() {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [deltaSnapshot, setDeltaSnapshot] = useState(null);
  const [lastDeltaLineSpeed, setLastDeltaLineSpeed] = useState(null);
  const [values, setValues] = usePersistentState('extrusion-calculator:production-rate:values', {
    lineSpeed: '',
    cutLength: '',
    unitsPerContainer: '',
    currentOrderContainer: '',
    totalOrderContainers: '',
    isOrderPartialActive: false,
    currentOrderUnitsInContainer: '',
  });

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30000);

    return () => window.clearInterval(timer);
  }, []);

  const baselineValues = deltaSnapshot?.values ?? values;
  const comparisonTime = deltaSnapshot?.capturedAt ?? currentTime;

  const production = useMemo(
    () =>
      calculateProduction(
        baselineValues.lineSpeed,
        baselineValues.cutLength,
        baselineValues.unitsPerContainer
      ),
    [baselineValues.cutLength, baselineValues.lineSpeed, baselineValues.unitsPerContainer]
  );

  const proposedProduction = useMemo(
    () =>
      calculateProduction(
        values.lineSpeed,
        baselineValues.cutLength,
        baselineValues.unitsPerContainer
      ),
    [baselineValues.cutLength, baselineValues.unitsPerContainer, values.lineSpeed]
  );

  const orderProgress = useMemo(
    () =>
      calculateActiveContainerProgressTiming(
        baselineValues.currentOrderContainer,
        baselineValues.totalOrderContainers,
        production?.containersPerHour,
        baselineValues.unitsPerContainer,
        baselineValues.isOrderPartialActive
          ? baselineValues.currentOrderUnitsInContainer
          : 0
      ),
    [
      baselineValues.currentOrderUnitsInContainer,
      baselineValues.currentOrderContainer,
      baselineValues.isOrderPartialActive,
      baselineValues.totalOrderContainers,
      baselineValues.unitsPerContainer,
      production?.containersPerHour,
    ]
  );

  const proposedOrderProgress = useMemo(
    () =>
      calculateActiveContainerProgressTiming(
        baselineValues.currentOrderContainer,
        baselineValues.totalOrderContainers,
        proposedProduction?.containersPerHour,
        baselineValues.unitsPerContainer,
        baselineValues.isOrderPartialActive
          ? baselineValues.currentOrderUnitsInContainer
          : 0
      ),
    [
      baselineValues.currentOrderContainer,
      baselineValues.currentOrderUnitsInContainer,
      baselineValues.isOrderPartialActive,
      baselineValues.totalOrderContainers,
      baselineValues.unitsPerContainer,
      proposedProduction?.containersPerHour,
    ]
  );

  const timePerContainerMetric = formatTimePerContainerMetric(
    production?.timePerContainerHours
  );

  function updateValue(key, nextValue) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  function toggleOrderPartial() {
    setValues((current) => ({
      ...current,
      isOrderPartialActive: !current.isOrderPartialActive,
    }));
  }

  function startDeltaSnapshot() {
    const baseline = { ...values };

    setDeltaSnapshot({
      values: baseline,
      capturedAt: new Date(),
    });

    if (lastDeltaLineSpeed !== null) {
      setValues((current) => ({ ...current, lineSpeed: lastDeltaLineSpeed }));
    }
  }

  function snapshotCurrentValues() {
    setLastDeltaLineSpeed(values.lineSpeed);
    setDeltaSnapshot({
      values: { ...values },
      capturedAt: new Date(),
    });
  }

  function handleDeltaBack() {
    if (deltaSnapshot) {
      setLastDeltaLineSpeed(values.lineSpeed);
      setValues(deltaSnapshot.values);
      setDeltaSnapshot(null);
    }
  }

  return (
    <CalculatorCard title="Production Rate" showHeader={false}>
      <div className="production-dashboard">
        <section className="production-panel production-base-panel">
          <div className="production-section-heading">
            <span>Base Inputs</span>
            <small>
              {deltaSnapshot ? `Baseline ${deltaSnapshot.values.lineSpeed} Feet/Min` : 'Feet/min and inches'}
            </small>
          </div>
          <div className="input-grid production-base-grid">
            <ProductionLineSpeedInput
              value={values.lineSpeed}
              onChange={(nextValue) => updateValue('lineSpeed', nextValue)}
              isDeltaActive={Boolean(deltaSnapshot)}
              baselineValue={deltaSnapshot?.values.lineSpeed}
              onStartDelta={startDeltaSnapshot}
              onBack={handleDeltaBack}
              onResnap={snapshotCurrentValues}
            />
            <NumberInput
              label="Cut Length"
              unit="inches"
              value={baselineValues.cutLength}
              disabled={Boolean(deltaSnapshot)}
              onChange={(nextValue) => updateValue('cutLength', nextValue)}
            />
            <NumberInput
              label="Units Per Container"
              value={baselineValues.unitsPerContainer}
              disabled={Boolean(deltaSnapshot)}
              onChange={(nextValue) => updateValue('unitsPerContainer', nextValue)}
            />
          </div>
        </section>

        <section className="production-panel production-core-panel">
          <div className="production-section-heading">
            <span>Core Production Metrics</span>
            {deltaSnapshot ? <small>Delta active</small> : null}
          </div>
          <div className="production-core-grid">
            <MetricCard
              label="Units Per Hour"
              value={
                production
                  ? formatNumber(production.unitsPerHour, { maximumFractionDigits: 0 })
                  : '-'
              }
              priority="primary"
              comparisonPosition="above"
              comparison={
                deltaSnapshot
                  ? metricComparison({
                      baselineValue: production?.unitsPerHour,
                      proposedValue: proposedProduction?.unitsPerHour,
                      format: (value) => formatNumber(value, { maximumFractionDigits: 0 }),
                      detailOptions: {
                        maximumFractionDigits: 0,
                        suffix: ' units/hr',
                      },
                    })
                  : null
              }
            />
            <MetricCard
              label="Containers Per Hour"
              value={
                production
                  ? formatNumber(production.containersPerHour, { maximumFractionDigits: 1 })
                  : '-'
              }
              priority="primary"
              comparisonPosition="above"
              comparison={
                deltaSnapshot
                  ? metricComparison({
                      baselineValue: production?.containersPerHour,
                      proposedValue: proposedProduction?.containersPerHour,
                      format: (value) => formatNumber(value, { maximumFractionDigits: 1 }),
                      detailOptions: {
                        maximumFractionDigits: 1,
                        suffix: ' containers/hr',
                      },
                    })
                  : null
              }
            />
            <MetricCard
              label="Time Per Container"
              unit={timePerContainerMetric.unit}
              value={timePerContainerMetric.value}
              priority="medium"
              comparisonPosition="above"
              comparison={
                deltaSnapshot
                  ? timePerContainerComparison(
                      production?.timePerContainerHours,
                      proposedProduction?.timePerContainerHours
                    )
                  : null
              }
            />
          </div>
        </section>

        <ProgressTracker
          title="Order Progress"
          currentLabel="Current Order Container"
          totalLabel="Total Order Containers"
          currentValue={baselineValues.currentOrderContainer}
          totalValue={baselineValues.totalOrderContainers}
          onCurrentChange={(nextValue) => updateValue('currentOrderContainer', nextValue)}
          onTotalChange={(nextValue) => updateValue('totalOrderContainers', nextValue)}
          progress={orderProgress}
          comparisonProgress={deltaSnapshot ? proposedOrderProgress : null}
          remainingLabel="Time Remaining On Order"
          completionLabel="Order Complete At"
          currentTime={comparisonTime}
          priority="primary"
          isPartialActive={baselineValues.isOrderPartialActive}
          partialUnitsValue={baselineValues.currentOrderUnitsInContainer}
          onPartialUnitsChange={(nextValue) =>
            updateValue('currentOrderUnitsInContainer', nextValue)
          }
          onTogglePartial={toggleOrderPartial}
          isLocked={Boolean(deltaSnapshot)}
        />
      </div>
    </CalculatorCard>
  );
}
