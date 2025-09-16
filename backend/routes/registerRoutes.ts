import { FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcrypt";
import dns from "dns";

export default async function RegisterRoutes(server: any) {
  server.post(
    "/signup",
    async (request: FastifyRequest, reply: FastifyReply) => {
      console.log("Signup request received");
      if (!request.body) {
        return reply.status(400).send({ error: "Body required" });
      }
      const { username, password, email } = request.body as {
        username: string;
        password: string;
        email: string;
      };
      const domain = email.split("@")[1];
      try {
        await new Promise((resolve, reject) => {
          dns.resolveMx(domain, (err, addresses) => {
            if (err || addresses.length === 0) {
              reject(new Error("Invalid email domain"));
            } else {
              resolve(addresses);
            }
          });
        });
      } catch (error) {
        return reply.status(400).send({ error: "Invalid email domain" });
      }
      if (!username || !password || !email) {
        return reply
          .status(400)
          .send({ error: "Username, password, and email are required" });
      }
      let query: string;

      query = "SELECT * FROM users WHERE email = ?";
      const existingUser = await server.db.get(query, [email]);

      if (existingUser) {
        return reply.status(400).send({ error: "Email already in use" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
      await server.db.run(query, [username, email, hashedPassword]);
      const user = await server.db.get(
        "SELECT id, name, email FROM users WHERE email = ?",
        [email]
      );
      if (!user) {
        return reply.status(500).send({ error: "User creation failed" });
      }
      const userPayload: { id: number; name: string; email: string } = {
        id: user.id,
        name: user.name,
        email: user.email,
      };
      const token = server.jwt.sign(userPayload);
      console.log("User signed up:", userPayload, "token:", token);

      return reply.status(201).send({
        user: userPayload,
        token: token,
        message: "User registered successfully",
      });
    }
  );
  server.post(
    "/login",
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.body) {
        return reply.status(400).send({ error: "Body required" });
      }
      const { email, password } = request.body as {
        email: string;
        password: string;
      };
      if (!email || !password) {
        return reply
          .status(400)
          .send({ error: "Email and password are required" });
      }
      const query = "SELECT * FROM users WHERE email = ?";
      const user = await server.db.get(query, [email]);
      if (!user) {
        return reply.status(400).send({ error: "Invalid email or password" });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return reply.status(400).send({ error: "Invalid email or password" });
      }
      const userPayload: { id: number; name: string; email: string } = {
        id: user.id,
        name: user.name,
        email: user.email,
      };
      const token = server.jwt.sign(userPayload);
      console.log("User logged in:", userPayload, "token:", token);

      return reply.status(200).send({
        user: userPayload,
        token: token,
        message: "Login successful",
      });
    }
  );
}
