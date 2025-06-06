// configs/db.js
import mongoose from "mongoose";
// No vuelvas a llamar a dotenv.config() aquí si ya lo hiciste en index.js,
// pero si no estás seguro, puedes repetirlo; no rompe nada.
import dotenv from "dotenv";
dotenv.config();

export const dbConnection = async () => {
  try {
    // Listeners (opcional)
    mongoose.connection.on("connecting", () => {
      console.log("MongoDB | try connecting");
    });
    mongoose.connection.on("connected", () => {
      console.log("MongoDB | connected to MongoDB");
    });
    mongoose.connection.on("open", () => {
      console.log("MongoDB | Connected to Database");
    });
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB | disconnected from MongoDB");
    });
    mongoose.connection.on("error", (err) => {
      console.log("MongoDB | could not connect to MongoDB", err);
      mongoose.disconnect();
    });

    // Aquí LE NUMERAS BIEN la variable:
    const uri = process.env.URI_MONGO;
    if (!uri) {
      throw new Error("La variable de entorno URI_MONGO no está definida.");
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 50,
    });
  } catch (err) {
    console.log(`Database connection failed: ${err}`);
  }
};
