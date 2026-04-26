import axios from "axios";

const axiosReq = axios.create({
  baseURL: 'http://localhost:4000/api' || process.env.NEXT_PUBLIC_BACKEND_URL
})

export default axiosReq

