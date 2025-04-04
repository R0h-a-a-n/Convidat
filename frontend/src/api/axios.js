import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3006',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:3000'
  }
});

// Add request interceptor for debugging
instance.interceptors.request.use(
  (config) => {
    console.log('Making request:', {
      url: config.url,
      method: config.method,
      params: config.params,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
instance.interceptors.response.use(
  (response) => {
    console.log('Received response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    return Promise.reject(error);
  }
);

export default instance; 