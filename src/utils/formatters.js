export function formatNumber(value, options = {}) {
  const {
    maximumFractionDigits = 2,
    minimumFractionDigits = 0,
    suffix = '',
    prefix = '',
  } = options;

  if (!Number.isFinite(value)) {
    return '-';
  }

  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits,
  }).format(value);

  return `${prefix}${formatted}${suffix}`;
}

export function formatSignedNumber(value, options = {}) {
  if (!Number.isFinite(value)) {
    return '-';
  }

  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, options)}`;
}

export function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return '-';
  }

  return formatSignedNumber(value * 100, {
    maximumFractionDigits: 1,
    suffix: '%',
  });
}

export function formatDuration(hoursValue) {
  if (!Number.isFinite(hoursValue)) {
    return '-';
  }

  const hours = Math.abs(hoursValue);
  const sign = hoursValue < 0 ? '-' : '';

  if (hours === 0) {
    return '0 min';
  }

  if (hours < 1) {
    return `${sign}${formatNumber(hours * 60, {
      maximumFractionDigits: hours < 1 / 60 ? 2 : 1,
      suffix: ' min',
    })}`;
  }

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 60) {
    return `${sign}${wholeHours + 1} hr`;
  }

  if (minutes === 0) {
    return `${sign}${wholeHours} hr`;
  }

  return `${sign}${wholeHours} hr ${minutes} min`;
}

export function formatCompletionTime(hoursFromNow, baseDate = new Date()) {
  if (!Number.isFinite(hoursFromNow)) {
    return '-';
  }

  const targetDate = new Date(baseDate.getTime() + hoursFromNow * 60 * 60 * 1000);
  const isSameDay = targetDate.toDateString() === baseDate.toDateString();

  return new Intl.DateTimeFormat('en-US', {
    weekday: isSameDay ? undefined : 'short',
    hourCycle: 'h23',
    hour: 'numeric',
    minute: '2-digit',
  }).format(targetDate);
}

export function toneForDelta(value, positiveWhenHigher = true) {
  if (!Number.isFinite(value) || value === 0) {
    return 'neutral';
  }

  const isPositive = positiveWhenHigher ? value > 0 : value < 0;
  return isPositive ? 'positive' : 'negative';
}
