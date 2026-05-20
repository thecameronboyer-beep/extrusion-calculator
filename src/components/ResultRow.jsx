export default function ResultRow({ label, value, detail, tone = 'neutral' }) {
  return (
    <div className={`result-row ${tone}`}>
      <span className="result-label">{label}</span>
      <strong className="result-value">{value}</strong>
      {detail ? <span className="result-detail">{detail}</span> : null}
    </div>
  );
}
