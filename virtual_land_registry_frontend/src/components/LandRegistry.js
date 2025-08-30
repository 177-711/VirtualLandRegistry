import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandCard from './LandCard';

export default function LandRegistry({ actor, isAuthenticated, principal }) {
  const [lands, setLands]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  useEffect(() => {
    if (actor) fetchLands();
  }, [actor]);

  async function fetchLands() {
    try {
      setLoading(true);
      const all = await actor.get_all_lands();
      setLands(all);
    } catch (err) {
      console.error(err);
      setError('Failed to load lands.');
    } finally {
      setLoading(false);
    }
  }

  function viewDetails(id) {
    navigate(`/land/${id}`);
  }

  async function buyLand(land) {
    if (!isAuthenticated) {
      return alert('Connect your wallet first');
    }
    try {
      await actor.purchase_land(land.id);
      alert('Purchase successful!');
      fetchLands();
    } catch (err) {
      console.error(err);
      alert('Purchase failed: ' + err);
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading registry...</p>
      </div>
    );
  }
  if (error) return <p className="text-center">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {lands.map(land => (
        <LandCard
          key={land.id}
          land={land}
          isOwned={land.owner === principal?.toString()}
          onViewDetails={viewDetails}
          onPurchase={buyLand}
        />
      ))}
    </div>
  );
}