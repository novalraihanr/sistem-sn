import axios from 'axios';

const APIEndpoint = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

export default APIEndpoint;
