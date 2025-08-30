export default function ErrorState({ error, retry }) {
  return (
    <div className="error">
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Something went wrong</div>
      <div style={{ color: 'var(--text-dim)', marginBottom: 10 }}>{String(error)}</div>
      {retry && <button className="btn" onClick={retry}>Retry</button>}
    </div>
  );
}