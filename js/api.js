const API_BASE =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "";

function setAuth(token, user) {
  if (token) localStorage.setItem("auth_token", token);
  if (user) localStorage.setItem("auth_user", JSON.stringify(user));
}
function getToken() { return localStorage.getItem("auth_token"); }
function getUser() { try { return JSON.parse(localStorage.getItem("auth_user")); } catch { return null; } }
function logout() { localStorage.removeItem("auth_token"); localStorage.removeItem("auth_user"); }

async function apiFetch(path, { method = "GET", body, headers } = {}) {
  const token = getToken();
  const opts = {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const resp = await fetch(`${API_BASE}${path}`, opts);
  const isJson = (resp.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await resp.json() : await resp.text();
  if (!resp.ok) throw new Error(isJson ? data?.error || data?.message : data);
  return data;
}

// --- Auth (Cliente & Admin) ---
async function registerUser({ nome, email, senha, tipo_usuario = "cliente", telefone = null }) {
  const data = await apiFetch("/api/auth/register", { method: "POST", body: { nome, email, senha, tipo_usuario, telefone } });
  setAuth(data.token, data.user); return data;
}
async function loginUser({ email, senha }) {
  const data = await apiFetch("/api/auth/login", { method: "POST", body: { email, senha } });
  setAuth(data.token, data.user); return data;
}
async function loginAdmin(payload) {
  const data = await loginUser(payload);
  if (data.user?.tipo_usuario !== "administrador") { logout(); throw new Error("Acesso restrito a administradores."); }
  return data;
}

// --- Cliente ---
async function fetchServices() { return apiFetch("/api/servicos"); }
async function fetchAgendaConfig() { return apiFetch("/api/agenda"); }
async function createAppointment({ id_servico, inicioISO, fimISO, observacoes }) {
  return apiFetch("/api/agendamentos", {
    method: "POST",
    body: { id_servico, data_hora_inicio: inicioISO, data_hora_fim: fimISO, observacoes: observacoes || null },
  });
}
async function fetchMyAppointments() { return apiFetch("/api/agendamentos/me"); }

// --- Admin: Serviços ---
async function adminFetchServices() {
  return apiFetch("/api/servicos/admin/all");
}
async function adminCreateService(data) {
  return apiFetch("/api/servicos", { method: "POST", body: data });
}
async function adminUpdateService(id, data) {
  return apiFetch(`/api/servicos/${id}`, { method: "PUT", body: data });
}
async function adminDeleteService(id) {
  return apiFetch(`/api/servicos/${id}`, { method: "DELETE" });
}

// --- Admin: Clientes (Usuários) ---
async function adminFetchClients() {
  return apiFetch("/api/usuarios");
}
async function adminCreateClient(data) {
  return apiFetch("/api/usuarios", { method: "POST", body: data });
}
async function adminUpdateClient(id, data) {
  return apiFetch(`/api/usuarios/${id}`, { method: "PUT", body: data });
}
async function adminDeleteClient(id) {
  return apiFetch(`/api/usuarios/${id}`, { method: "DELETE" });
}

// --- Admin: Agendamentos ---
async function adminFetchAppointments() {
  return apiFetch("/api/agendamentos");
}
async function adminUpdateAppointment(id, data) {
  return apiFetch(`/api/agendamentos/${id}`, { method: "PUT", body: data });
}
async function adminDeleteAppointment(id) {
  return apiFetch(`/api/agendamentos/${id}`, { method: "DELETE" });
}

window.API = Object.freeze({
  API_BASE,
  setAuth, getToken, getUser, logout,
  registerUser, loginUser, loginAdmin,
  
  fetchServices, fetchAgendaConfig,
  createAppointment, fetchMyAppointments,
  
  adminFetchServices,
  adminCreateService,
  adminUpdateService,
  adminDeleteService,
  
  adminFetchClients,
  adminCreateClient,
  adminUpdateClient,
  adminDeleteClient,
  
  adminFetchAppointments,
  adminUpdateAppointment,
  adminDeleteAppointment
});