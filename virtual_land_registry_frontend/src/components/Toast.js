import { createContext, useContext, useMemo, useState } from 'react';

const ToastCtx = createContext(null);

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastHost() {
  const [toasts, setToasts] = useState([]);
  const api = useMemo(() => ({
    push(msg, kind = 'ok', ttl = 2800) {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, msg, kind }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl);
    }
  }), []);
  return (
    <ToastCtx.Provider value={api}>
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}