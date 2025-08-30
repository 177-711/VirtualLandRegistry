import React, { useState, useEffect } from 'react';

export default function MyLands({ actor, principal }) {
  const [lands, setLands]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [price, setPrice]       = useState('');
  const [meta, setMeta]         = useState({ environment: '', special_features: '', access_roads: '', utilities: '' });
  const [mode, setMode]         = useState('');

  useEffect(() => {
    if (actor && principal) loadMy();
  }, [actor, principal]);

  async function loadMy() {
    try {
      setLoading(true);
      const res = await actor.get_lands_by_owner(principal);
      setLands(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function listSale(id) {
    if (!price) return alert('Enter price');
    try {
      setLoading(true);
      const res = await actor.list_for_sale(id, BigInt(price));
      if (res.Ok !== undefined) loadMy();
      else alert(`Error: ${Object.keys(res.Err)[0]}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function removeSale(id) {
    try {
      setLoading(true);
      const res = await actor.remove_from_sale(id);
      if (res.Ok !== undefined) loadMy();
      else alert(`Error: ${Object.keys(res.Err)[0]}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function transfer(id) {
    const to = prompt('New owner principal:');
    if (!to) return;
    try {
      setLoading(true);
      const res = await actor.transfer_land(id, to);
      if (res.Ok !== undefined) loadMy();
      else alert(`Error: ${Object.keys(res.Err)[0]}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateMeta(id) {
    const payload = {
      environment: meta.environment ? [meta.environment] : [],
      special_features: meta.special_features.split(',').map(s => s.trim()),
      access_roads: meta.access_roads.split(',').map(s => s.trim()),
      utilities: meta.utilities.split(',').map(s => s.trim())
    };
    try {
      setLoading(true);
      const res = await actor.update_land_metadata(id, payload);
      if (res.Ok !== undefined) loadMy();
      else alert(`Error: ${Object.keys(res.Err)[0]}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function area({ width, height }) {
    return width * height;
  }
  function volume({ width, height, depth }) {
    return width * height * depth;
  }
  function fmtDate(ts) {
    return new Date(Number(ts)/1e6).toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading your lands...</p>
      </div>
    );
  }

  if (!lands.length) {
    return (
      <div className="empty-state text-center p-8">
        <p>You have no lands yet.</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-6">My Lands</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {lands.map(l => (
          <div key={l.id} className="card p-4">
            <h4>Land #{l.id}</h4>
            <p><strong>Area:</strong> {area(l.dimensions)} units²</p>
            <p><strong>Volume:</strong> {volume(l.dimensions)} units³</p>
            <p><strong>Registered:</strong> {fmtDate(l.created_at)}</p>
            <p><strong>Metadata:</strong> {l.metadata[0]?.environment || '—'}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => { setSelected(l.id); setMode('sale'); }} className="btn btn-primary btn-small">
                List for Sale
              </button>
              <button onClick={() => { setSelected(l.id); setMode('meta'); }} className="btn btn-secondary btn-small">
                Update Meta
              </button>
              <button onClick={() => transfer(l.id)} className="btn btn-outline btn-small">
                Transfer
              </button>
            </div>
          </div>
        ))}
      </div>

      {(mode === 'sale' && selected) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>List #{selected} for Sale</h3>
              <button className="modal-close" onClick={() => setMode('')}>×</button>
            </div>
            <div className="modal-body">
              <input
                type="number"
                className="form-input"
                placeholder="Price in cycles"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setMode('')} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => listSale(selected)} className="btn btn-primary">
                List
              </button>
            </div>
          </div>
        </div>
      )}

      {(mode === 'meta' && selected) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Update Metadata #{selected}</h3>
              <button className="modal-close" onClick={() => setMode('')}>×</button>
            </div>
            <div className="modal-body grid gap-4">
              <input
                type="text"
                className="form-input"
                placeholder="Environment"
                value={meta.environment}
                onChange={e => setMeta(m => ({ ...m, environment: e.target.value }))}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Special features (comma-separated)"
                value={meta.special_features}
                onChange={e => setMeta(m => ({ ...m, special_features: e.target.value }))}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Access roads"
                value={meta.access_roads}
                onChange={e => setMeta(m => ({ ...m, access_roads: e.target.value }))}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Utilities"
                value={meta.utilities}
                onChange={e => setMeta(m => ({ ...m, utilities: e.target.value }))}
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setMode('')} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => updateMeta(selected)} className="btn btn-primary">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}