import { FastifyRequest, FastifyReply } from "fastify";

export default async function OnboardingRoutes(server: any) {
  server.post(
    "/onboarding",
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.body) {
        return reply.status(400).send({ error: "Body required" });
      }
      let user;
      try {
        user = server.jwt.verify(
          request.headers.authorization?.split(" ")[1] || ""
        );
      } catch (err) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      const { age, height, weight, goal } = request.body as {
        age: number;
        height: number;
        weight: number;
        goal: string;
      };
      if (!age || !height || !weight || !goal) {
        return reply.status(400).send({
          error: "All fields: age, height, weight, goal are required",
        });
      }
      //   check if user already have profiles
      const existingProfile = await server.db.get(
        "SELECT * FROM profiles WHERE user_id = ?",
        [user.id]
      );
      if (existingProfile) {
        return reply
          .status(400)
          .send({ error: "Profile already exists for this user" });
      }

      const query =
        "INSERT INTO profiles (user_id, age, height, weight, goal) VALUES (?, ?, ?, ?, ?)";
      await server.db.run(query, [user.id, age, height, weight, goal]);
      const OnboardingData = await server.db.get(
        "SELECT * FROM profiles WHERE user_id = ?",
        [user.id]
      );
      if (!OnboardingData) {
        return reply.status(500).send({ error: "Onboarding failed" });
      }
      console.log("Onboarding data saved for user:", user.id);
      console.log("Onboarding data : ", OnboardingData);
      return reply.status(200).send({ message: "Onboarding complete" });
    }
  );
  //   get onboarding data
  server.get(
    "/onboarding",
    async (request: FastifyRequest, reply: FastifyReply) => {
      let user;
      try {
        user = server.jwt.verify(
          request.headers.authorization?.split(" ")[1] || ""
        );
      } catch (err) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      const onboardingData = await server.db.get(
        "SELECT * FROM profiles WHERE user_id = ?",
        [user.id]
      );
      if (!onboardingData) {
        return reply.status(404).send({ error: "Onboarding data not found" });
      }
      return reply.status(200).send({ onboardingData });
    }
  );
  //   put method for updating onboarding data
  server.put(
    "/onboarding",
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.body) {
        return reply.status(400).send({ error: "Body required" });
      }
      let user;
      try {
        user = server.jwt.verify(
          request.headers.authorization?.split(" ")[1] || ""
        );
      } catch (err) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      const { age, height, weight, goal } = request.body as {
        age: number;
        height: number;
        weight: number;
        goal: string;
      };
      if (!age || !height || !weight || !goal) {
        return reply.status(400).send({
          error: "All fields: age, height, weight, goal are required",
        });
      }
      const existingProfile = await server.db.get(
        "SELECT * FROM profiles WHERE user_id = ?",
        [user.id]
      );
      if (!existingProfile) {
        return reply
          .status(400)
          .send({ error: "Profile does not exist for this user" });
      }
      const query =
        "UPDATE profiles SET age = ?, height = ?, weight = ?, goal = ? WHERE user_id = ?";
      await server.db.run(query, [age, height, weight, goal, user.id]);
      const updatedOnboardingData = await server.db.get(
        "SELECT * FROM profiles WHERE user_id = ?",
        [user.id]
      );
      if (!updatedOnboardingData) {
        return reply.status(500).send({ error: "Onboarding update failed" });
      }
      console.log("Onboarding data updated for user:", user.id);
      console.log("Updated Onboarding data : ", updatedOnboardingData);
      return reply.status(200).send({ message: "Onboarding updated" });
    }
  );
}
