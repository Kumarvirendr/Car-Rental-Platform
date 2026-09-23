import mongoose from "mongoose";

import  dns  from 'dns';


//change DNS
dns.setServers(["1.1.1.1","8.8.8.8"]);

const connectionDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
       console.log("MongoDB Connected");
    }catch(error){
        console.log("Database Error",error);
        process.exit(1);
    
    }
}
export default  connectionDB;