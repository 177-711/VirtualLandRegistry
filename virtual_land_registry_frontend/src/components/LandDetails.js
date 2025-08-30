import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function LandDetails({ actor, principal }) {
  const { landId } = useParams();
  const navigate   = useNavigate();
  const [land, setLand]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [isOwner, setIsOwner]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newOwner, setNewOwner]   = useState('');

  useEffect(() => {
    if (actor) loadLand();
  }, [actor]);

  async function loadLand() {
    try {
      setLoading(true);
      const result = await actor.get_land(BigInt(landId));
      if (result.length) {
        setLand(result[0]);
        setIsOwner(result[0].owner === principal?.toString());
      } else {
        setError('Land not found');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load land');
    } finally {
      setLoading(false);
    }
  }

  async function transfer() {
    if (!newOwner.trim()) return alert('Enter a valid principal');
    try {
      setLoading(true);
      const res = await actor.transfer_land(BigInt(landId), newOwner);
      if (res.Ok !== undefined) {
        alert('Transfer successful!');
        setShowModal(false);
        loadLand();
      } else {
        alert(`Error: ${Object.keys(res.Err)[0]}`);
      }
    } catch (err) {
      console.error(err);
      alert('Transfer failed');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading details...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">Back</button>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => navigate(-1)} className="btn btn-secondary mb-4">
        ← Back
      </button>
      <div className="card">
        <div className="card-body">
          <h2>Land #{land.id}</h2>
          <p><strong>Coords:</strong> ({land.coordinates.x}, {land.coordinates.y})</p>
          <p><strong>Area:</strong> {land.size} units²</p>
          <p><strong>Price:</strong> {land.price} ICP</p>
          <p><strong>Owner:</strong> {land.owner}</p>
          <p><strong>Status:</strong> {land.for_sale ? 'For Sale' : 'Not for Sale'}</p>
          <p className="mt-2">{land.description}</p>
        </div>
        <div className="card-footer">
          {isOwner ? (
            <>
              <button onClick={() => setShowModal(true)} className="btn btn-primary mr-2">
                Transfer
              </button>
              <button onClick={() => alert('Toggle sale needs backend')} className="btn btn-secondary">
                {land.for_sale ? 'Remove Sale' : 'Put for Sale'}
              </button>
            </>
          ) : land.for_sale ? (
            <button onClick={() => alert('Purchase logic')} className="btn btn-success">
              Purchase
            </button>
          ) : null}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Transfer Ownership</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-input"
                placeholder="New principal ID"
                value={newOwner}
                onChange={e => setNewOwner(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary mr-2">
                Cancel
              </button>
              <button onClick={transfer} className="btn btn-primary" disabled={!newOwner.trim()}>
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}