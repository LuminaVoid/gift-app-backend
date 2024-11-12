import mongoose from "mongoose";

export const mongoSetup = async () => {
  await mongoose.connect(process.env.DB_URL, {
    authSource: "admin",
  });
};
