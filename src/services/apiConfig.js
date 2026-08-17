// src/services/apiConfig.js
//
// Central backend configuration.
//
// The base URL is read from the EXPO_PUBLIC_API_URL environment variable so it
// can differ per environment (local backend, staging, production) without
// touching source code. Expo inlines EXPO_PUBLIC_* variables at build time;
// create a .env file (see .env.example) and restart the bundler after changes.
//
//   EXPO_PUBLIC_API_URL=https://api.sdcart.example.com
//
// The local development fallback assumes the Spring Boot backend runs on
// localhost:8080 (docker compose up in the backend directory).

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

export const API_PREFIX = '/api/v1';
