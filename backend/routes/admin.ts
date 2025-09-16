import { FastifyRequest, FastifyReply } from "fastify";

export default async function AdminRoutes(server: any) {
  server.get(
    "/admin/users",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (request.headers.authorization === undefined) {
          return reply.status(401).send({ error: "Unauthorized" });
        }
        const user = server.jwt.verify(
          request.headers.authorization?.split(" ")[1] || ""
        );
        if (!user) {
          return reply.status(401).send({ error: "Unauthorized" });
        }
        console.log("user : ", user);
        if (user.email !== "taoussi.aimen@gmail.com") {
          return reply.status(403).send({ error: "Forbidden" });
        }
        const users = await server.db.all("SELECT id, name, email FROM users");
        return reply.status(200).send({ users });
      } catch (error) {
        console.error("Error fetching users:", error);
        return reply.status(500).send({ error: "Failed to fetch users" });
      }
    }
  );
}
