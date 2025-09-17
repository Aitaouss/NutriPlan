import { FastifyRequest, FastifyReply } from "fastify";

interface PlanRequest extends FastifyRequest {
  body: {
    user_id: number;
    plan_data?: any;
    bmi?: number;
  };
}

interface UpdatePlanRequest extends FastifyRequest {
  params: {
    id: string;
  };
  body: {
    plan_data?: any;
    bmi?: number;
  };
}

export default async function PlansRoutes(server: any) {
  // POST /plans → generate plan (based on onboarding)
  server.post("/plans", async (request: PlanRequest, reply: FastifyReply) => {
    try {
      if (!request.body) {
        return reply.status(400).send({ error: "Body required" });
      }

      const { user_id, plan_data, bmi } = request.body;

      if (!user_id) {
        return reply.status(400).send({ error: "user_id is required" });
      }

      // Get user profile data for onboarding information
      const profile = await server.db.get(
        "SELECT * FROM profiles WHERE user_id = ?",
        [user_id]
      );

      if (!profile) {
        return reply.status(404).send({
          error: "User profile not found. Please complete onboarding first.",
        });
      }

      // Calculate BMI if not provided
      let calculatedBMI = bmi;
      if (!calculatedBMI && profile.height && profile.weight) {
        // BMI = weight(kg) / (height(m))^2
        const heightInMeters = profile.height / 100; // assuming height in cm
        calculatedBMI = profile.weight / (heightInMeters * heightInMeters);
      }

      // Generate plan based on profile data
      const generatedPlan = {
        goal: profile.goal,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        bmi: calculatedBMI,
        calories_target: calculateCaloriesTarget(profile),
        macros: calculateMacros(profile),
        ...plan_data, // Allow additional plan data
      }; // Insert plan into database
      const result = await server.db.run(
        "INSERT INTO plans (user_id, plan_data, bmi) VALUES (?, ?, ?)",
        [user_id, JSON.stringify(generatedPlan), calculatedBMI]
      );

      // Verify the insertion was successful
      if (!result || !result.lastInsertRowid) {
        throw new Error("Failed to insert plan into database");
      }

      // Get the created plan
      const createdPlan = await server.db.get(
        "SELECT * FROM plans WHERE id = ?",
        [result.lastInsertRowid]
      );

      // Verify we got the plan back
      if (!createdPlan) {
        throw new Error("Failed to retrieve created plan from database");
      }

      console.log("Successfully created plan:", createdPlan);

      return reply.status(201).send({
        message: "Plan generated successfully",
        plan: {
          ...createdPlan,
          plan_data: JSON.parse(createdPlan.plan_data),
        },
      });
    } catch (error) {
      console.error("Error generating plan:", error);
      return reply.status(500).send({ error: "Failed to generate plan" });
    }
  });

  // GET /plans → get all plans (or latest)
  server.get("/plans", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { user_id, latest } = request.query as {
        user_id?: string;
        latest?: string;
      };

      if (!user_id) {
        return reply
          .status(400)
          .send({ error: "user_id query parameter is required" });
      }

      let query: string;
      let params: any[];

      if (latest === "true") {
        // Get the latest plan for the user
        query =
          "SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1";
        params = [user_id];
      } else {
        // Get all plans for the user
        query =
          "SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC";
        params = [user_id];
      }

      const plans =
        latest === "true"
          ? await server.db.get(query, params)
          : await server.db.all(query, params);

      if (!plans || (Array.isArray(plans) && plans.length === 0)) {
        return reply
          .status(404)
          .send({ error: "No plans found for this user" });
      }

      // Parse plan_data JSON for each plan
      const parsedPlans = Array.isArray(plans)
        ? plans.map((plan) => ({
            ...plan,
            plan_data: JSON.parse(plan.plan_data),
          }))
        : {
            ...plans,
            plan_data: JSON.parse(plans.plan_data),
          };

      return reply.send({
        message:
          latest === "true" ? "Latest plan retrieved" : "Plans retrieved",
        plans: parsedPlans,
      });
    } catch (error) {
      console.error("Error retrieving plans:", error);
      return reply.status(500).send({ error: "Failed to retrieve plans" });
    }
  });

  // PUT /plans/:id → update a plan (customization)
  server.put(
    "/plans/:id",
    async (request: UpdatePlanRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params;

        if (!request.body) {
          return reply.status(400).send({ error: "Body required" });
        }

        const { plan_data, bmi } = request.body;

        if (!plan_data && !bmi) {
          return reply
            .status(400)
            .send({ error: "plan_data or bmi is required for update" });
        }

        // Get existing plan
        const existingPlan = await server.db.get(
          "SELECT * FROM plans WHERE id = ?",
          [id]
        );

        if (!existingPlan) {
          return reply.status(404).send({ error: "Plan not found" });
        }

        // Parse existing plan data
        const currentPlanData = JSON.parse(existingPlan.plan_data);

        // Merge with new data
        const updatedPlanData = {
          ...currentPlanData,
          ...plan_data,
        };

        // Update the plan
        await server.db.run(
          "UPDATE plans SET plan_data = ?, bmi = ? WHERE id = ?",
          [JSON.stringify(updatedPlanData), bmi || existingPlan.bmi, id]
        );

        // Get updated plan
        const updatedPlan = await server.db.get(
          "SELECT * FROM plans WHERE id = ?",
          [id]
        );

        return reply.send({
          message: "Plan updated successfully",
          plan: {
            ...updatedPlan,
            plan_data: JSON.parse(updatedPlan.plan_data),
          },
        });
      } catch (error) {
        console.error("Error updating plan:", error);
        return reply.status(500).send({ error: "Failed to update plan" });
      }
    }
  );
}

// Helper functions for plan generation
function calculateCaloriesTarget(profile: any): number {
  // Basic BMR calculation using Mifflin-St Jeor Equation
  // For men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
  // For women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161

  // Assuming male for now, you can add gender field to profile
  const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;

  // Apply activity factor (sedentary = 1.2)
  let calories = bmr * 1.2;

  // Adjust based on goal
  switch (profile.goal?.toLowerCase()) {
    case "lose weight":
    case "weight loss":
      calories -= 500; // 500 calorie deficit
      break;
    case "gain weight":
    case "weight gain":
      calories += 500; // 500 calorie surplus
      break;
    default:
      // maintain weight
      break;
  }

  return Math.round(calories);
}

function calculateMacros(profile: any) {
  const calories = calculateCaloriesTarget(profile);

  // Adjust macro distribution based on goal
  let proteinPercent = 0.25; // Default 25%
  let carbPercent = 0.45; // Default 45%
  let fatPercent = 0.3; // Default 30%

  switch (profile.goal?.toLowerCase()) {
    case "lose weight":
    case "weight loss":
      // Higher protein for muscle preservation during weight loss
      proteinPercent = 0.3; // 30% protein
      carbPercent = 0.4; // 40% carbs
      fatPercent = 0.3; // 30% fat
      break;
    case "gain weight":
    case "weight gain":
      // More carbs for energy and muscle building
      proteinPercent = 0.25; // 25% protein
      carbPercent = 0.5; // 50% carbs
      fatPercent = 0.25; // 25% fat
      break;
    default:
      // Maintain weight - balanced approach
      proteinPercent = 0.25; // 25% protein
      carbPercent = 0.45; // 45% carbs
      fatPercent = 0.3; // 30% fat
      break;
  }

  const proteinCalories = calories * proteinPercent;
  const carbCalories = calories * carbPercent;
  const fatCalories = calories * fatPercent;

  return {
    protein: Math.round(proteinCalories / 4), // 4 calories per gram
    carbs: Math.round(carbCalories / 4), // 4 calories per gram
    fat: Math.round(fatCalories / 9), // 9 calories per gram
  };
}
