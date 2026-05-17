const API_URL = 'http://127.0.0.1:8000/api/v1';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  // 如果 body 是 FormData，不要設置 Content-Type，讓瀏覽器自動處理 boundary
  const isFormData = options.body instanceof FormData;
  
  const headers: Record<string, string> = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...Object.fromEntries(Object.entries(options.headers || {}).map(([k, v]) => [k, String(v)])),
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '#/login';
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Something went wrong');
  }

  return response.json();
}
