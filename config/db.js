import mongoose from "mongoose";

export const ConnectDb = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(console.log("Database connected"));
  } catch (error) {
    console.log(error);
    process.exit();
  }
};
