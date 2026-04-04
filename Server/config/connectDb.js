import mongoose from "mongoose";

export const connectDB = async () => {
  
if (!process.env.MONGODB_URI) {
  throw new Error("Provide MONGODB_URI in .env");
}
  try {
    await mongoose.connect(process.env.MONGODB_URI) 
    console.log("DB Connected"); 
  } catch (error) { 
    console.error("Mongodb connect error", error);
    throw error
  }  
};
 