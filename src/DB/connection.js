import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";


const connectionDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI,{
            serverSelectionTimeoutMS:5000
        });
        console.log("Connected to MongoDB");
    } catch (error) {    
        console.log(error.message);
    }
}

export default connectionDB