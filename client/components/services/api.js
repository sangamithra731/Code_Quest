import axios from 'axios';

const BASE_URL = 'http://localhost:5050'; // your Express server

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // needed so the refresh-token cookie gets sent/stored
});

// Attach the access token (if we have one) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cq_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh: if a request 401s (expired access token), silently get a
// new one using the httpOnly refresh cookie, then retry the original call.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await api.post('/api/auth/refresh');
        const newToken = res.data.accessToken;
        localStorage.setItem('cq_access_token', newToken);
        if (res.data.user) {
          localStorage.setItem('cq_user', JSON.stringify(res.data.user));
        }
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('cq_access_token');
        localStorage.removeItem('cq_user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export async function signup({ name, email, password }) {
  const res = await api.post('/api/auth/signup', { name, email, password });
  localStorage.setItem('cq_access_token', res.data.accessToken);
  localStorage.setItem('cq_user', JSON.stringify(res.data.user));
  return res.data;
}

export async function login({ email, password }) {
  const res = await api.post('/api/auth/login', { email, password });
  localStorage.setItem('cq_access_token', res.data.accessToken);
  localStorage.setItem('cq_user', JSON.stringify(res.data.user));
  return res.data;
}

export async function logout() {
  await api.post('/api/auth/logout');
  localStorage.removeItem('cq_access_token');
  localStorage.removeItem('cq_user');
}

export async function getDashboard() {
  try {
    const res = await api.get('/api/users/me/dashboard');
    return res.data;
  } catch (err) {
    // Backend endpoint not wired yet, or offline — fall back to safe defaults
    // so the UI never breaks.
    return {
      level: 1, xp: 0, xpIntoLevel: 0, xpForNextLevel: 100,
      streak: 0, badges: [], certificates: [],
      courseProgress: {},
    };
  }
}

// Returns the language + all modules/levels with unlocked/completed flags
export async function getLanguageProgress(languageSlug) {
  const res = await api.get(`/api/progress/languages/${languageSlug}`);
  return res.data.language;
}

// Fetches full study content (theory/examples/practice/quiz) for one level.
export async function getLevelById(levelId) {
  const res = await api.get(`/api/progress/levels/${levelId}`);
  return res.data.level;
}

// ModulePage needs a whole module (all its levels) by slug, but the backend
// only exposes single levels by id. So: look up the module's level ids via
// getLanguageProgress, then fetch each level's full content and assemble it.
export async function getModule(languageId, moduleSlug) {
  const language = await getLanguageProgress(languageId);

  const mod = language.modules.find((m) => m.slug === moduleSlug);
  if (!mod) {
    throw new Error(`Module "${moduleSlug}" not found for language "${languageId}"`);
  }

  const levels = await Promise.all(
    mod.levels.map((lvl) => getLevelById(lvl.id))
  );

  return {
    id: mod.id,
    slug: mod.slug,
    title: mod.title,
    language: language.name,
    levels,
  };
}

// Submits a level attempt. Backend expects a real scorePercent (0-100),
// not just a boolean — see progressController.submitLevel.
export async function submitLevel(levelId, { passed }) {
  const res = await api.post(`/api/progress/levels/${levelId}/submit`, {
    passed,
  });
  return res.data.result;
}

export default api;