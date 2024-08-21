import axios from "axios";

const axiosReq = axios.create({
    baseURL: 'https://sacaturno-server-ereef.ondigitalocean.app/api'
    
    /*baseURL: 'http://localhost:4000/api'*/
})

export default axiosReq

