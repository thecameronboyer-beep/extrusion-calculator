export default function ModeToggle({ options, value, onChange }) {
  return (
    <div className="mode-toggle">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={option.id === value ? 'mode-button active' : 'mode-button'}
          onClick={() => onChange(option.id)}
        >
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
