// import axios from 'axios';

// // Use Vite's way to access environment variables
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Interceptor to add JWT token (same as before)
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('habitToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Authentication endpoints
// export const registerUser = (userData) => api.post('/auth/register', userData);
// export const loginUser = (credentials) => api.post('/auth/login', credentials);
// export const getMe = () => api.get('/auth/me');

// // Habit endpoints
// export const createHabit = (habitData) => api.post('/habits', habitData);
// export const getHabits = () => api.get('/habits');
// export const getTodaysHabits = () => api.get('/habits/today');
// export const trackHabit = (habitId) => api.post(`/habits/${habitId}/track`);
// // Add updateHabit, deleteHabit etc. later

// // Get a single habit by ID
// export const getHabitById = (id) => api.get(`/habits/${id}`);

// // Update a habit
// export const updateHabit = (id, habitData) => api.put(`/habits/${id}`, habitData);

// // Delete (archive) a habit
// export const deleteHabit = (id) => api.delete(`/habits/${id}`);
// // --- End Copy ---

// export const getChallenges = () => api.get('/challenges');

// export const updateProfilePicture = (imageUrl) => api.put('/users/profile/picture', { imageUrl });

// export default api;

// src/services/api.js
import axios from 'axios';

// Use Vite's way to access environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  // REMOVED default headers section, or at least the Content-Type line:
  // headers: {
  //   'Content-Type': 'application/json', // <-- DELETE THIS LINE
  // },
});

// Interceptor to add JWT token (keep this)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('habitToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let Axios handle Content-Type automatically based on data type
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Authentication endpoints (Keep As Is) ---
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getMe = () => api.get('/auth/me');

// --- Habit endpoints (Keep As Is) ---
export const createHabit = (habitData) => api.post('/habits', habitData);
export const getHabits = () => api.get('/habits');
export const getTodaysHabits = () => api.get('/habits/today');
// Modify trackHabit slightly if you send notes (already done previously)
export const trackHabit = (habitId, data = {}) => api.post(`/habits/${habitId}/track`, data);
export const getHabitById = (id) => api.get(`/habits/${id}`);
export const updateHabit = (id, habitData) => api.put(`/habits/${id}`, habitData);
export const deleteHabit = (id) => api.delete(`/habits/${id}`);
// Optional: Update notes (if implemented)
export const updateHabitEntryNotes = (entryId, notes) => api.put(`/habits/entries/${entryId}`, { notes });

// --- Challenge endpoint (Keep As Is) ---
export const getChallenges = () => api.get('/challenges');

// --- !! CORRECTED updateProfilePicture !! ---
// It needs to accept FormData, not an imageUrl string
export const updateProfilePicture = (formData) => {
  // Axios automatically sets Content-Type to multipart/form-data for FormData
  return api.put('/users/profile/picture', formData);
};
// -----------------------------------------

export default api;