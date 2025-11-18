// src/app.js

import express from "express";
import cors from "cors";
import buyTicketRoute from "./routes/buyTicketRoute.js";
import participantsRoute from "./routes/participantsRoute.js";
import userTicketsRoute from "./routes/userTicketsRoute.js";




const app = express();

// ----------- MIDDLEWARE -----------
app.use(cors()); // allow frontend to connect
app.use(express.json()); // parse JSON body

// ----------- ROUTES -----------
app.use("/", buyTicketRoute);
app.use("/", participantsRoute);
app.use("/", userTicketsRoute);

// Health check route (optional)
app.get("/", (req, res) => {
  res.send("Service Lottery Backend Running...");
});

export default app;
