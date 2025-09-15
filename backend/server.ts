import Fastify, { FastifyInstance } from "fastify";
import dotenv from "dotenv";
import fastifyJwt from "@fastify/jwt";
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { FastifyRequest, FastifyReply } from "fastify";
import RegisterRoutes from "./routes/registerRoutes";
import AdminRoutes from "./routes/admin";
import OnboardingRoutes from "./routes/onboardingRoutes";

dotenv.config();

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
  }
}

const server: FastifyInstance = Fastify({
  logger: false,
});

const DB_FOLDER = path.join(__dirname, "db");
const DB_PATH = path.join(DB_FOLDER, "database.db");
const SQL_PATH = path.join(DB_FOLDER, "struct.sql");

if (!fs.existsSync(DB_FOLDER)) {
  fs.mkdirSync(DB_FOLDER);
}

if (!fs.existsSync(DB_PATH)) {
  const dbInit = new sqlite3.Database(DB_PATH);
  const sql = fs.readFileSync(SQL_PATH, "utf8");
  dbInit.exec(sql, (err) => {
    if (err) console.error("Error running migration:", err);
    else console.log("Database created and migrated using struct.sql");
    dbInit.close();
  });
}

// Register JWT plugin
server.register(fastifyJwt, {
  secret: "supersecret",
});

const PORT = process.env.PORT || 9000;

server.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
  return { message: "Welcome to the Fastify server!" };
});

const start = async (): Promise<void> => {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  server.decorate("db", db);
  server.register(RegisterRoutes);
  server.register(AdminRoutes);
  server.register(OnboardingRoutes);

  try {
    await server.listen({ port: Number(PORT), host: "0.0.0.0" });
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

start();
