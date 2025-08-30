import React from 'react';

export default function LandCard({ land, onViewDetails, onPurchase, isOwned = false }) {
  const buy = e => { e.stopPropagation(); onPurchase && onPurchase(land); };
  const view = () => { onViewDetails && onViewDetails(land.id); };

  return (
    <div className="card" onClick={view} style={{ cursor: 'pointer' }}>
      <div className="card-header flex justify-between items-center">
        <span>🏞️</span>
        <span className={land.for_sale ? 'text-green-600' : 'text-gray-600'}>
          {land.for_sale ? 'For Sale' : 'Owned'}
        </span>
      </div>
      <div className="card-body">
        <h3>Virtual Land #{land.id}</h3>
        <p><strong>Coords:</strong> ({land.coordinates.x}, {land.coordinates.y})</p>
        <p><strong>Area:</strong> {land.size} units²</p>
        <p><strong>Price:</strong> {land.price} ICP</p>
        {!isOwned && <p><strong>Owner:</strong> {land.owner.slice(0,8)}...</p>}
        {land.description && <p className="mt-2">{land.description}</p>}
      </div>
      <div className="card-footer flex justify-between">
        <button onClick={e => { e.stopPropagation(); view(); }} className="btn btn-secondary btn-small">
          Details
        </button>
        {land.for_sale && !isOwned && (
          <button onClick={buy} className="btn btn-primary btn-small">
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}