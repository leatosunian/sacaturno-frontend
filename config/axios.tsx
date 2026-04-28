import axios from "axios";

const axiosReq = axios.create({
  baseURL:  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'
})

export default axiosReq

