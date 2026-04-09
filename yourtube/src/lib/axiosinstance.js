import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://yourtube-jfcz.onrender.com";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
