import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink
} from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import './App.css';

import { idlFactory, canisterId } from './declarations/virtual_land_registry_backend';

import LandRegistry from './components/LandRegistry';
import Marketplace  from './components/Marketplace';
import MyLands       from './components/MyLands';
import LandDetails   from './components/LandDetails';
import Analytics     from './components/Analytics';

function App() {
  const [authClient, setAuthClient]           = useState(null);
  const [actor, setActor]                     = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal]             = useState(null);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    (async () => {
      const client = await AuthClient.create();
      setAuthClient(client);

      const authenticated = await client.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const identity = client.getIdentity();
        setPrincipal(identity.getPrincipal());
        await initActor(identity);
      } else {
        await initActor();
      }

      setLoading(false);
    })();
  }, []);

  async function initActor(identity = null) {
    const agent = new HttpAgent({
      identity,
      host: process.env.NODE_ENV === 'production'
        ? 'https://ic0.app'
        : 'http://localhost:4943'
    });
    if (process.env.NODE_ENV !== 'production') {
      await agent.fetchRootKey();
    }
    const instance = Actor.createActor(idlFactory, {
      agent,
      canisterId
    });
    setActor(instance);
  }

  async function login() {
    setLoading(true);
    await authClient.login({
      identityProvider: 'https://identity.ic0.app',
      onSuccess: async () => {
        setIsAuthenticated(true);
        const id = authClient.getIdentity().getPrincipal();
        setPrincipal(id);
        await initActor(authClient.getIdentity());
        setLoading(false);
      },
      onError: () => setLoading(false)
    });
  }

  async function logout() {
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
    await initActor();
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading Virtual Land Registry...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <NavLink to="/" className="logo">
            <h1>🏗️ Virtual Land Registry</h1>
            <span>Decentralized Land Management on ICP</span>
          </NavLink>
          <nav className="nav-menu">
            <NavLink to="/" end className="nav-link">Registry</NavLink>
            <NavLink to="/marketplace" className="nav-link">Marketplace</NavLink>
            {isAuthenticated && (
              <NavLink to="/my-lands" className="nav-link">My Lands</NavLink>
            )}
            <NavLink to="/analytics" className="nav-link">Analytics</NavLink>
          </nav>
          <div className="auth-section">
            {isAuthenticated ? (
              <>
                <span className="principal-id">
                  {principal.toString().slice(0, 8)}...
                </span>
                <button onClick={logout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <button onClick={login} className="btn btn-primary">
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <LandRegistry
                actor={actor}
                isAuthenticated={isAuthenticated}
                principal={principal}
              />
            }/>
            <Route path="/marketplace" element={
              <Marketplace
                actor={actor}
                isAuthenticated={isAuthenticated}
                principal={principal}
              />
            }/>
            <Route path="/my-lands" element={
              isAuthenticated
                ? <MyLands actor={actor} principal={principal}/>
                : (
                  <div className="auth-required">
                    <h2>Authentication Required</h2>
                    <p>Please connect your wallet to view your lands.</p>
                    <button onClick={login} className="btn btn-primary">
                      Connect Wallet
                    </button>
                  </div>
                )
            }/>
            <Route path="/land/:landId" element={
              <LandDetails actor={actor} principal={principal}/>
            }/>
            <Route path="/analytics" element={
              <Analytics actor={actor} isAuthenticated={isAuthenticated}/>
            }/>
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2024 Virtual Land Registry. Built on ICP.</p>
          <div className="footer-links">
            <a href="https://internetcomputer.org" target="_blank" rel="noopener noreferrer">
              About ICP
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;