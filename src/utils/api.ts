export async function apiFetch(url: string, options: any = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  options.headers = options.headers || {};
  if (token) options.headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, options);
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }
  return res;
} 