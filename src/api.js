const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');
export const getToken = () => localStorage.getItem('taoban_token') || '';
export const setToken = (t) => t ? localStorage.setItem('taoban_token', t) : localStorage.removeItem('taoban_token');
async function req(path, opts = {}) {
  const r = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: 'Bearer ' + getToken() } : {}) }, ...opts });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'request failed');
  return j;
}
export const api = {
  health: () => req('/api/health'),
  requestOtp: (phone) => req('/api/auth/request-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone, code) => req('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, code }) }),
  me: () => req('/api/me'),
  saveSocials: (handles) => req('/api/me/socials', { method: 'PUT', body: JSON.stringify({ handles }) }),
  feed: () => req('/api/feed'),
  projects: (status) => req('/api/projects' + (status ? '?status=' + status : '')),
  postProject: (desc, links) => req('/api/projects', { method: 'POST', body: JSON.stringify({ desc, links }) }),
  copy: (id) => req(`/api/projects/${id}/copy`, { method: 'POST', body: JSON.stringify({}) }),
  done: (id) => req(`/api/projects/${id}/done`, { method: 'POST', body: JSON.stringify({}) }),
  shareProject: (id) => req(`/api/projects/${id}/share`, { method: 'POST', body: JSON.stringify({}) }),
  report: (id, text) => req(`/api/projects/${id}/report`, { method: 'POST', body: JSON.stringify({ text }) }),
  logs: () => req('/api/logs'),
  users: (search) => req('/api/users?search=' + encodeURIComponent(search || '')),
  userOne: (phone) => req('/api/users/' + encodeURIComponent(phone)),
  classPosts: (cls) => req('/api/class/' + cls),
  likeClass: (id) => req(`/api/class/${id}/like`, { method: 'POST', body: JSON.stringify({}) }),
  shareClass: (id) => req(`/api/class/${id}/share`, { method: 'POST', body: JSON.stringify({}) }),
  commentClass: (id, text) => req(`/api/class/${id}/comment`, { method: 'POST', body: JSON.stringify({ text }) }),
  adminPost: (target, text, video, isExam, hint) => req('/api/admin/class', { method: 'POST', body: JSON.stringify({ target, text, video, isExam, hint }) }),
  examToggle: () => req('/api/admin/exam/toggle', { method: 'POST', body: JSON.stringify({}) }),
  examSubmit: (id, fileUrl, fileType) => req(`/api/exam/${id}/submit`, { method: 'POST', body: JSON.stringify({ fileUrl, fileType }) }),
  classLog: (userId) => req('/api/class-log/' + encodeURIComponent(userId)),
  ban: (phone) => req('/api/admin/ban', { method: 'POST', body: JSON.stringify({ phone }) }),
  delProject: (id) => req(`/api/admin/projects/${id}`, { method: 'DELETE' }),
};
export async function backendOnline() { try { await api.health(); return true; } catch { return false; } }
