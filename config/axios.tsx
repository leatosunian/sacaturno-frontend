import axios from "axios";

const axiosReq = axios.create({
    baseURL: `https://sacaturno-server-production.up.railway.app/api`
})

export default axiosReq

