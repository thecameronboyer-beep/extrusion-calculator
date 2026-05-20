export default function CalculatorCard({
  title,
  summary,
  children,
  results,
  headerContent,
  showHeader = true,
  className = '',
}) {
  return (
    <article className={`calculator-card ${showHeader ? '' : 'no-heading'} ${className}`}>
      {showHeader ? (
        <div className="calculator-heading">
          {headerContent ?? (
            <>
              <div>
                <h2>{title}</h2>
              </div>
              {summary ? <p className="calculator-summary">{summary}</p> : null}
            </>
          )}
        </div>
      ) : null}

      <div className="calculator-layout">
        <div className="input-panel">{children}</div>
        {results ? <div className="output-panel">{results}</div> : null}
      </div>
    </article>
  );
}
