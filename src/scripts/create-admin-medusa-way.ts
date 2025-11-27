import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function createAdminUser({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  
  const email = process.env.MEDUSA_ADMIN_EMAIL;
  const password = process.env.MEDUSA_ADMIN_PASSWORD;

  if (!email || !password) {
    logger.warn("MEDUSA_ADMIN_EMAIL or MEDUSA_ADMIN_PASSWORD not set, skipping admin user creation");
    return;
  }

  logger.info(`[Create Admin] Checking if admin user exists: ${email}`);

  try {
    // Use Medusa's user module to check and create user
    const userModuleService = container.resolve("userModuleService");
    
    // Check if user exists
    const existingUsers = await userModuleService.listUsers({
      email: email
    });

    if (existingUsers.length > 0) {
      logger.info("[Create Admin] Admin user already exists");
      return;
    }

    logger.info("[Create Admin] Creating admin user...");

    // Create user using Medusa's method (this will handle password hashing correctly)
    const user = await userModuleService.createUsers({
      email: email,
      first_name: "Admin",
      last_name: "User"
    });

    logger.info(`[Create Admin] User created with ID: ${user.id}`);

    // Now create the auth provider identity
    const authModuleService = container.resolve("authModuleService");
    
    await authModuleService.createAuthIdentities({
      provider: "emailpass",
      entity_id: email,
      provider_metadata: {
        password: password // Medusa will hash this properly
      },
      app_metadata: {
        user_id: user.id
      }
    });

    logger.info("✅ [Create Admin] Admin user created successfully!");
    logger.info(`   Email: ${email}`);
    
  } catch (error) {
    logger.error("[Create Admin] Error creating admin user:", error);
    throw error;
  }
}

