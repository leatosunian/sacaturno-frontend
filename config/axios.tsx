import axios from "axios";

const axiosReq = axios.create({
    baseURL: process.env.BACKEND_URL
    /*baseURL: 'http://localhost:4000/api'*/
})

export default axiosReq

