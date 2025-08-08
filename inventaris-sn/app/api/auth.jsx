import axios from "../api/api.jsx";

export const login = async (email, password) => {
  await axios.get('/sanctum/csrf-cookie');

  return axios.post('/api/login', {
    email,
    password,
  })
}

export const getUser = async () => {
  return axios.get('/api/user');
}

export const logout = async () => {
  return axios.post('/api/logout');
}
