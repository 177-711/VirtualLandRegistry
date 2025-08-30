import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "./virtual_land_registry_backend.did.js";

export { idlFactory } from "./virtual_land_registry_backend.did.js";

// Canister IDs - these will be set by dfx during build
export const canisterId = 
  process.env.CANISTER_ID_VIRTUAL_LAND_REGISTRY_BACKEND ||
  process.env.REACT_APP_VIRTUAL_LAND_REGISTRY_BACKEND_CANISTER_ID;

/**
 * Creates an actor to interact with the virtual_land_registry_backend canister
 * @param {Object} options - Configuration options
 * @param {HttpAgent} options.agent - The HTTP agent to use for requests
 * @param {string} options.canisterId - The canister ID (optional, uses default if not provided)
 * @returns {Actor} The actor instance
 */
export const createActor = (options = {}) => {
  const agent = options.agent || new HttpAgent({ 
    host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943" 
  });
  
  if (process.env.DFX_NETWORK !== "ic") {
    agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check if the local replica is running");
      console.error(err);
    });
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId: options.canisterId || canisterId,
  });
};

// Default actor instance for convenience
export const virtual_land_registry_backend = canisterId ? createActor() : undefined;