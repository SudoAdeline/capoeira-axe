export async function api(path, options = {}) {
  const token = localStorage.getItem('ginga_token');
  const res = await fetch(path, {
    ...options,
    headers: {
      ...(options.body && !(options.headers?.['Content-Type'] === false) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // Only force reload if we had a token (session expired)
    // Don't reload on login/register failures
    const hadToken = !!token;
    localStorage.removeItem('ginga_token');
    if (hadToken && !path.includes('/api/auth/login') && !path.includes('/api/auth/register')) {
      window.location.reload();
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
