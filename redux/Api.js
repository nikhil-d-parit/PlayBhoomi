import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Api = axios.create({
  baseURL: "https://venue-backend-vigy.onrender.com/api/admin",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to each request if available
Api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default Api;
