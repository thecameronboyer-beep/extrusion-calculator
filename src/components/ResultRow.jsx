import { useEffect, useRef } from 'react';

export default function ResultRow({
  label,
  value,
  detail,
  tone = 'neutral',
  className = '',
  onLongPress,
  title,
}) {
  const pressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);

  function clearPressTimer() {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }

  function handlePressStart() {
    if (!onLongPress) {
      return;
    }

    clearPressTimer();
    longPressTriggeredRef.current = false;
    pressTimerRef.current = window.setTimeout(triggerLongPress, 1000);
  }

  function triggerLongPress() {
    if (!onLongPress || longPressTriggeredRef.current) {
      return;
    }

    clearPressTimer();
    longPressTriggeredRef.current = true;
    onLongPress();
  }

  function handleContextMenu(event) {
    if (!onLongPress) {
      return;
    }

    event.preventDefault();
    triggerLongPress();
  }

  useEffect(() => clearPressTimer, []);

  return (
    <div
      className={`result-row ${tone} ${className}`}
      title={title}
      onPointerDown={handlePressStart}
      onPointerUp={clearPressTimer}
      onPointerCancel={clearPressTimer}
      onPointerLeave={clearPressTimer}
      onContextMenu={handleContextMenu}
    >
      <span className="result-label">{label}</span>
      <strong className="result-value">{value}</strong>
      {detail ? <span className="result-detail">{detail}</span> : null}
    </div>
  );
}
