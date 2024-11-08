import express, { Express } from "express";
import authRoutes from "./routes/auth"
import avatarRoutes from "./routes/avatar"
import admin from "./routes/admin"
import spaces from "./routes/spaces"
import dotenv from "dotenv";
import cors from "cors";
import { authenticateToken } from "./middlewares/tokenAuthorization";
import { resetDatabaseAdmin } from "./controllers/resetDb";

dotenv.config();
const app: Express = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/v1/', authRoutes);
app.use('/api/v1/avatars', avatarRoutes);
app.use('/api/v1/user', avatarRoutes);
app.use('/api/v1/admin', admin);
app.use('/api/v1/space', spaces);
app.delete('/api/v1/reset',authenticateToken, resetDatabaseAdmin);

app.get("/", (req, res) => {
  res.send(`express server working`);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at: ${port}`);
});
