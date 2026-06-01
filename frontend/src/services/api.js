import axios from "axios";

const api = axios.create({
  baseURL: "https://igate-crm.onrender.com/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nexcrm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("nexcrm_token");
      localStorage.removeItem("nexcrm_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
  changePassword: (data) => api.post("/auth/change-password", data),
};

export const leadsService = {
  getAll: (params) => api.get("/leads", { params }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post("/leads", data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  updateStatut: (id, statut) => api.patch(`/leads/${id}/statut`, { statut }),
  delete: (id) => api.delete(`/leads/${id}`),
  addActivite: (id, data) => api.post(`/leads/${id}/activites`, data),
};

export const statsService = {
  dashboard: () => api.get("/stats/dashboard"),
  platform: () => api.get("/stats/platform"),
};

export const usersService = {
  getAll: () => api.get("/users"),
  create: (data) => api.post("/users", data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const companiesService = {
  getAll: () => api.get("/companies"),
  create: (data) => api.post("/companies", data),
  updateStatut: (id, statut) => api.patch(`/companies/${id}/statut`, { statut }),
};

export const integrationsService = {
  getAll: () => api.get("/integrations"),
  save: (data) => api.post("/integrations", data),
  toggle: (source) => api.patch(`/integrations/${source}/toggle`),
};

export const formService = {
  getConfig: (slug) => api.get(`/form/${slug}`),
  submit: (slug, data) => api.post(`/form/${slug}/submit`, data),
};

export default api;
