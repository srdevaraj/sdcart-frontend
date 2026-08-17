// src/services/apiConfig.js
//
// Central backend configuration.
//
// The base URL is read from the EXPO_PUBLIC_API_URL environment variable so it
// can differ per environment (local backend, staging, production) without
// touching source code. Expo inlines EXPO_PUBLIC_* variables at build time;
// create a .env file (see .env.example) and restart the bundler after changes.
//
//   EXPO_PUBLIC_API_URL=https://sdcart-demo-backend.onrender.com
//
// The default (no .env / no env var) is the deployed Render backend so that a
// physical device always talks to a reachable HTTPS server. To develop against
// a local Spring Boot backend instead, set EXPO_PUBLIC_API_URL in .env to e.g.
// http://localhost:8080 — never commit that .env file.

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://sdcart-demo-backend.onrender.com';

export const API_PREFIX = '/api/v1';
