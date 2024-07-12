import axios from "axios";

const axiosReq = axios.create({
    baseURL: 'https://sacaturno-server-production.up.railway.app/api'
    /*baseURL: 'http://localhost:4000/api'*/
})

export default axiosReq

