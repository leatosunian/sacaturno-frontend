import "dotenv/config"
import { connect } from "mongoose"

async function connectDB() {
    const MONGO_URL = <string>process.env.MONGO_URL
    try {
        const {connection} = await connect(MONGO_URL)
        console.log(connection);
        
        if(connection.readyState === 1){
            console.log('Database connected');
            return Promise.resolve(true)
        } 
    } catch (error) {
        console.log(error);
        return Promise.reject(false)
    }

}



export default connectDB