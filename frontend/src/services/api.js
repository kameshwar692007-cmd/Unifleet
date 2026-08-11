import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

export const api = {
  getRobots: () => axios.get(`${API_BASE}/robots`),
  getRobotDetails: (id) => axios.get(`${API_BASE}/robots/${id}`),
  sendRobotCommand: (id, command) => axios.post(`${API_BASE}/robots/${id}/command`, { command }),

  getJobs: () => axios.get(`${API_BASE}/jobs`),
  createJob: (source_node, target_node, priority = 1, assigned_robot_id = null) => 
    axios.post(`${API_BASE}/jobs`, { source_node, target_node, priority, assigned_robot_id }),
  explainScheduling: (source_node, target_node) => 
    axios.get(`${API_BASE}/jobs/explain-scheduling`, { params: { source_node, target_node } }),

  getTopology: () => axios.get(`${API_BASE}/warehouse/topology`),
  getEvents: () => axios.get(`${API_BASE}/warehouse/events`),
  getAlerts: () => axios.get(`${API_BASE}/warehouse/alerts`),

  getWorkflows: () => axios.get(`${API_BASE}/workflows`),
  getCongestion: () => axios.get(`${API_BASE}/intelligence/congestion`),
  compareRoutes: (source_node, target_node) => 
    axios.get(`${API_BASE}/intelligence/compare-routes`, { params: { source_node, target_node } }),

  triggerDemoAct: (actNumber) => axios.post(`${API_BASE}/demo/act${actNumber}`)
};
