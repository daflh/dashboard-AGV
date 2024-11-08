const JWT_TOKEN_LS_KEY = 'jwtToken';

export function getBackendUrl() {
  const { protocol, host } = window.location;
  const isProd = import.meta.env['PROD'];
  const backendPort = import.meta.env['VITE_BACKEND_PORT'] ?? '8001';
  const backendUrl = isProd
    ? `${protocol}//${host}`
    : `${protocol}//${host.split(':')[0]}:${backendPort}`;

  return backendUrl;
}

export function getJwtToken() {
  return localStorage.getItem(JWT_TOKEN_LS_KEY);
}

// TODO: use cookies instead of localStorage for security
export function setJwtToken(token: string | null) {
  if (token === null) {
    localStorage.removeItem(JWT_TOKEN_LS_KEY);
  } else {
    localStorage.setItem(JWT_TOKEN_LS_KEY, token);
  }
}
