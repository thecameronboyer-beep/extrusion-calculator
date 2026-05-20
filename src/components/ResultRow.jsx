import { useRef } from 'react';

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
    pressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      onLongPress();
    }, 1000);
  }

  function handleContextMenu(event) {
    if (longPressTriggeredRef.current) {
      event.preventDefault();
    }
  }

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
