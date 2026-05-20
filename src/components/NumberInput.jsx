export default function NumberInput({
  label,
  value,
  onChange,
  unit,
  min = '0',
  step = 'any',
  note,
  disabled = false,
}) {
  const inputId = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <label className="number-field" htmlFor={inputId}>
      <span className="number-label">
        {label}
        {unit ? <span className="number-unit"> {unit}</span> : null}
      </span>
      <input
        id={inputId}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      {note ? <span className="field-note">{note}</span> : null}
    </label>
  );
}
