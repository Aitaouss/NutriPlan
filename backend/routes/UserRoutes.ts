import { FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcrypt";

export default async function UserRoutes(server: any) {
  // GET /user - Get current user information from token
  server.get("/user", async (request: FastifyRequest, reply: FastifyReply) => {
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

    try {
      // Get user data from database (excluding password)
      const userData = await server.db.get(
        "SELECT id, name, email FROM users WHERE id = ?",
        [user.id]
      );

      if (!userData) {
        return reply.status(404).send({ error: "User not found" });
      }

      console.log("User data retrieved for user:", user.id);
      return reply.status(200).send({
        user: userData,
        message: "User data retrieved successfully",
      });
    } catch (error) {
      console.error("Error retrieving user data:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // GET /user/profile - Get user with profile information
  server.get(
    "/user/profile",
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

      try {
        // Get user data (excluding password)
        const userData = await server.db.get(
          "SELECT id, name, email FROM users WHERE id = ?",
          [user.id]
        );

        if (!userData) {
          return reply.status(404).send({ error: "User not found" });
        }

        // Get profile data if exists
        const profileData = await server.db.get(
          "SELECT age, height, weight, goal FROM profiles WHERE user_id = ?",
          [user.id]
        );

        console.log("User profile data retrieved for user:", user.id);
        return reply.status(200).send({
          user: userData,
          profile: profileData || null,
          message: "User profile data retrieved successfully",
        });
      } catch (error) {
        console.error("Error retrieving user profile data:", error);
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // PUT /user - Update user information (name, email)
  server.put("/user", async (request: FastifyRequest, reply: FastifyReply) => {
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

    const { name, email } = request.body as {
      name?: string;
      email?: string;
    };

    // Validate that at least one field is provided
    if (!name && !email) {
      return reply.status(400).send({
        error: "At least one field (name or email) is required",
      });
    }

    try {
      // Check if user exists
      const existingUser = await server.db.get(
        "SELECT id FROM users WHERE id = ?",
        [user.id]
      );

      if (!existingUser) {
        return reply.status(404).send({ error: "User not found" });
      }

      // Check if email is already taken by another user (if email is being updated)
      if (email) {
        const emailExists = await server.db.get(
          "SELECT id FROM users WHERE email = ? AND id != ?",
          [email, user.id]
        );

        if (emailExists) {
          return reply.status(400).send({ error: "Email already in use" });
        }
      }

      // Build dynamic update query
      const updates = [];
      const values = [];

      if (name) {
        updates.push("name = ?");
        values.push(name);
      }

      if (email) {
        updates.push("email = ?");
        values.push(email);
      }

      values.push(user.id); // Add user ID for WHERE clause

      const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
      await server.db.run(query, values);

      // Get updated user data
      const updatedUser = await server.db.get(
        "SELECT id, name, email FROM users WHERE id = ?",
        [user.id]
      );

      if (!updatedUser) {
        return reply.status(500).send({ error: "User update failed" });
      }

      console.log("User data updated for user:", user.id);
      console.log("Updated user data:", updatedUser);
      return reply.status(200).send({
        user: updatedUser,
        message: "User updated successfully",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // PUT /user/password - Update user password
  server.put(
    "/user/password",
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

      const { currentPassword, newPassword } = request.body as {
        currentPassword: string;
        newPassword: string;
      };

      if (!currentPassword || !newPassword) {
        return reply.status(400).send({
          error: "Both currentPassword and newPassword are required",
        });
      }

      if (newPassword.length < 6) {
        return reply.status(400).send({
          error: "New password must be at least 6 characters long",
        });
      }

      try {
        // Get current user with password
        const existingUser = await server.db.get(
          "SELECT id, password FROM users WHERE id = ?",
          [user.id]
        );

        if (!existingUser) {
          return reply.status(404).send({ error: "User not found" });
        } // Verify current password
        const isValidPassword = await bcrypt.compare(
          currentPassword,
          existingUser.password
        );

        if (!isValidPassword) {
          return reply
            .status(400)
            .send({ error: "Current password is incorrect" });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await server.db.run("UPDATE users SET password = ? WHERE id = ?", [
          hashedNewPassword,
          user.id,
        ]);

        console.log("Password updated for user:", user.id);
        return reply.status(200).send({
          message: "Password updated successfully",
        });
      } catch (error) {
        console.error("Error updating password:", error);
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
}
