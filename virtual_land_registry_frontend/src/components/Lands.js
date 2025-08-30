import { useEffect, useState } from 'react';
import { listLands, registerLand } from '../utils/api';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import LandCard from '../components/LandCard';
import LandForm from '../components/LandForm';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function Lands() {
  const [lands, setLands] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const load = async () => {
    setError(null);
    try {
      const data = await listLands();
      setLands(data || []);
    } catch (e) { setError(e); }
  };

  useEffect(() => { load(); }, []);

  return (
    <section className="stack-lg">
      <div className="page-header">
        <h2>All lands</h2>
        <div className="badge">Total: {lands?.length ?? '—'}</div>
      </div>

      <LandForm
        busy={busy}
        onSubmit={async (payload) => {
          setBusy(true);
          try {
            await registerLand(payload);
            toast.push('Land registered successfully', 'ok');
            await load();
          } catch (e) {
            setError(e);
            toast.push('Failed to register land', 'err');
          } finally {
            setBusy(false);
          }
        }}
      />

      {!lands && !error && (
        <div className="grid cards">
          {[...Array(6)].map((_, i) => <div key={i} className="card"><div className="card-body stack"><div className="skeleton" style={{height:22, width:'60%'}}></div><div className="skeleton" style={{height:14, width:'80%'}}></div><div className="skeleton" style={{height:14, width:'40%'}}></div></div></div>)}
        </div>
      )}

      {error && <ErrorState error={error} retry={load} />}

      {lands && lands.length === 0 && <EmptyState message="No lands yet. Be the first to register!" />}

      <div className="grid cards">
        {lands && lands.map((land) => {
          const id = land.id ?? land.land_id;
          return (
            <LandCard key={String(id)} land={land} onClick={() => navigate(`/lands/${id}`)} />
          );
        })}
      </div>
    </section>
  );
}