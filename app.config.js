// Dynamic Expo config.
//
// Expo reads the web base path from `experiments.baseUrl` (NOT `web.baseUrl`).
// We inject it from the EXPO_BASE_URL env var so:
//   - local dev / Expo Go (no env)        -> no baseUrl, app served at "/"
//   - GitHub Pages build (env = "/repo")  -> assets + routes prefixed correctly
//
// The base for everything else still comes from app.json.
module.exports = ({ config }) => {
  const baseUrl = (process.env.EXPO_BASE_URL || '').trim().replace(/\/+$/, '');

  return {
    ...config,
    experiments: {
      ...(config.experiments || {}),
      ...(baseUrl ? { baseUrl } : {}),
    },
  };
};
