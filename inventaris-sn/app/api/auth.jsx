import APIEndpoint from "../api/api.jsx";

export const login = async (email, password) => {
  await APIEndpoint.get('/sanctum/csrf-cookie');

  return APIEndpoint.post('/api/login', {
    email,
    password,
  })
}

export const getUser = async () => {
  return APIEndpoint.get('/api/user');
}

export const logout = async () => {
  return APIEndpoint.post('/api/logout');
}
