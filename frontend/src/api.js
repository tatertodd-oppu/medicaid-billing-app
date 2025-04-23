import axios from "axios";

const BASE = "https://billing-backend-weac.onrender.com/api";

export const getRecipients = () => axios.get(`${BASE}/recipients`);
export const addRecipient = (recipient) => axios.post(`${BASE}/recipients`, recipient);
export const deleteRecipient = (id) => axios.delete(`${BASE}/recipients/${id}`);


export const getSchedules = () => axios.get(`${BASE}/schedules`);
export const addSchedule = (schedule) => axios.post(`${BASE}/schedules`, schedule);

export const saveBillingInput = (entries) =>
  axios.post(`${BASE}/billing-input`, { entries });

export const getOutput = () => axios.get(`${BASE}/output`);
export const downloadExport = () => axios.get(`${BASE}/export`, { responseType: "blob", headers: {Accept: "application/octet-stream",}});
export const clearOutput = () => axios.delete(`${BASE}/output`);

export const deleteSchedule = (id) =>
  axios.delete(`${BASE}/schedules/${id}`);

