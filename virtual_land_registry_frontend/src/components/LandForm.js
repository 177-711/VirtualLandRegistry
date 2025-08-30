import { useState } from 'react';

export default function LandForm({ onSubmit, busy }) {
  const [form, setForm] = useState({ name: '', coordinates: '', area: '', uri: '', price: '' });
  const [errors, setErrors] = useState({});
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.coordinates.trim()) e.coordinates = 'Required';
    if (form.area === '' || Number(form.area) <= 0) e.area = 'Must be > 0';
    if (form.price !== '' && Number(form.price) < 0) e.price = 'Must be ≥ 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Register new land</div>
      </div>
      <div className="card-body">
        <form
          className="land-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validate()) return;
            onSubmit({
              ...form,
              area: Number(form.area),
              price: form.price === '' ? 0 : Number(form.price),
            });
          }}
        >
          <input className="input" placeholder="Name" value={form.name} onChange={update('name')} required />
          <input className="input" placeholder="Coordinates (e.g., 12.97,77.59)" value={form.coordinates} onChange={update('coordinates')} required />
          <input className="input" placeholder="Area (sqm)" type="number" value={form.area} onChange={update('area')} required />
          <input className="input" placeholder="Metadata URI (optional)" value={form.uri} onChange={update('uri')} />
          <input className="input" placeholder="Initial Price (optional)" type="number" value={form.price} onChange={update('price')} />
          <button type="submit" className="btn primary" disabled={busy}>{busy ? 'Submitting…' : 'Register Land'}</button>
        </form>
        <div className="row" style={{ marginTop: 8, gap: 16 }}>
          {Object.entries(errors).map(([k, v]) => (
            <span key={k} className="badge" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#fecaca' }}>
              {k}: {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}