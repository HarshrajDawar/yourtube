import axios from "axios";
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "https://yourtube-zg73.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
 
});
export default axiosInstance;
