import React, { useState, useEffect } from 'react';

export default function Marketplace({ actor, isAuthenticated, principal }) {
  const [listings, setListings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filters, setFilters]         = useState({
    land_type: '',
    min_price: '',
    max_price: '',
    min_area: ''
  });

  const landTypes = [
    'Residential','Commercial','Industrial','Agricultural','Entertainment','Mixed'
  ];

  useEffect(() => {
    if (actor) loadListings();
  }, [actor]);

  async function loadListings() {
    try {
      setLoading(true);
      const all = await actor.get_marketplace_listings();
      setListings(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function doSearch() {
    if (!actor) return;
    try {
      setLoading(true);
      const f = {
        land_type:  filters.land_type ? [{ [filters.land_type]: null }] : [],
        min_price:  filters.min_price ? [BigInt(filters.min_price)] : [],
        max_price:  filters.max_price ? [BigInt(filters.max_price)] : [],
        coordinates_range: [],
        min_area:   filters.min_area ? [Number(filters.min_area)] : [],
        features:   []
      };
      const res = await actor.search_marketplace(f);
      setListings(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function buy(landId) {
    if (!isAuthenticated) return alert('Connect wallet');
    try {
      setLoading(true);
      const res = await actor.buy_land(landId);
      if (res.Ok !== undefined) {
        alert('Purchased');
        loadListings();
      } else {
        alert(`Error: ${Object.keys(res.Err)[0]}`);
      }
    } catch (err) {
      console.error(err);
      alert('Purchase failed');
    } finally {
      setLoading(false);
    }
  }

  const fmtPrice = p => new Intl.NumberFormat().format(p.toString());
  const fmtDate  = ts => new Date(Number(ts)/1e6).toLocaleDateString();
  const area     = d => d.width * d.height;

  return (
    <div className="marketplace">
      <h2 className="text-center mb-6">Virtual Land Marketplace</h2>

      <div className="card p-6 mb-8">
        <h3 className="mb-4">Filter Listings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <select
            className="form-input"
            value={filters.land_type}
            onChange={e => setFilters(f => ({...f, land_type: e.target.value}))}
          >
            <option value="">All Types</option>
            {landTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            className="form-input"
            type="number"
            placeholder="Min Price"
            value={filters.min_price}
            onChange={e => setFilters(f => ({...f, min_price: e.target.value}))}
          />
          <input
            className="form-input"
            type="number"
            placeholder="Max Price"
            value={filters.max_price}
            onChange={e => setFilters(f => ({...f, max_price: e.target.value}))}
          />
          <input
            className="form-input"
            type="number"
            placeholder="Min Area"
            value={filters.min_area}
            onChange={e => setFilters(f => ({...f, min_area: e.target.value}))}
          />
          <button onClick={doSearch} className="btn btn-secondary">Search</button>
          <button onClick={loadListings} className="btn btn-outline">Show All</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="empty-state text-center p-8">
          <p>No items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(item => (
            <div key={item.land_id.toString()} className="card p-4">
              <div className="flex justify-between items-center mb-2">
                <h4>Land #{item.land_id.toString()}</h4>
                <span className="font-semibold">
                  {fmtPrice(item.price)} cycles
                </span>
              </div>
              <p><strong>Coords:</strong> ({item.land_info.coordinates.x},{item.land_info.coordinates.y},{item.land_info.coordinates.z})</p>
              <p><strong>Size:</strong> {item.land_info.dimensions.width}×{item.land_info.dimensions.height}×{item.land_info.dimensions.depth}</p>
              <p><strong>Area:</strong> {area(item.land_info.dimensions)} units²</p>
              <p className="mt-2">{item.land_info.description}</p>
              <div className="mt-4 text-right">
                {isAuthenticated && principal.toString() !== item.seller.toString() ? (
                  <button onClick={() => buy(item.land_id)} className="btn btn-primary">
                    Buy Now
                  </button>
                ) : (
                  <span className="text-sm italic">Your Listing</span>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Seller: {item.seller.toString().slice(0,8)}... | Listed: {fmtDate(item.listed_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
);
}