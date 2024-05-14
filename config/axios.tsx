import axios from "axios";

const axiosReq = axios.create({
    baseURL: `http://127.0.0.1:4000/api`
})

export default axiosReq

