
import axios from 'axios'
import { useAuthStore } from "src/stores/Auth";

const Api = axios.create({
    baseURL: 'http://localhost:3000/api',
    
})

Api.interceptors.request.use(
    
    (config) => {
      const store = useAuthStore();
      const token = store.token; // Aquí debes poner tu lógica para obtener el token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

export default Api