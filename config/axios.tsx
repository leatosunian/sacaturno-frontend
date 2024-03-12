import axios from "axios";

const axiosReq = axios.create({
    baseURL: `${process.env.BACKEND_URL}/api`
})

export default axiosReq

