import { db } from "../config/database";
import { users } from "../models/schema";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { ApiError } from "../utils/api-error";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { withTransaction, DbContext } from "../utils/transaction";
import { authLogger, logSuccess, logError } from "../utils/logger";

export const authService = {
  async register(input: RegisterInput) {
    const startTime = Date.now();
    authLogger.info({ email: input.email, role: input.role }, "Starting user registration");

    return withTransaction(async (tx) => {
      // Check if user already exists
      const existingUser = await tx
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        authLogger.warn({ email: input.email }, "Registration failed: email already exists");
        throw ApiError.conflict("Email already registered");
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Create user - force role to 'tenant' for public registration
      // Manager and technician roles should only be created by admins
      const [newUser] = await tx
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          passwordHash,
          role: "tenant",
          phone: input.phone,
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          phone: users.phone,
          avatarUrl: users.avatarUrl,
          isActive: users.isActive,
          createdAt: users.createdAt,
        });

      // Generate token
      const token = signToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      logSuccess(
        authLogger,
        "User registered successfully",
        Date.now() - startTime,
        { userId: newUser.id, email: newUser.email, role: newUser.role }
      );

      return {
        user: newUser,
        token,
      };
    });
  },

  async login(input: LoginInput) {
    const startTime = Date.now();
    authLogger.info({ email: input.email }, "Login attempt");

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (!user) {
      authLogger.warn({ email: input.email }, "Login failed: user not found");
      throw ApiError.unauthorized("Invalid credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      authLogger.warn({ email: input.email, userId: user.id }, "Login failed: account deactivated");
      throw ApiError.forbidden("Account is deactivated");
    }

    // Verify password
    const isValidPassword = await comparePassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      authLogger.warn({ email: input.email, userId: user.id }, "Login failed: invalid password");
      throw ApiError.unauthorized("Invalid credentials");
    }

    // Generate token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { passwordHash, ...userWithoutPassword } = user;

    logSuccess(
      authLogger,
      "User logged in successfully",
      Date.now() - startTime,
      { userId: user.id, email: user.email, role: user.role }
    );

    return {
      user: userWithoutPassword,
      token,
    };
  },

  async getMe(userId: string) {
    authLogger.debug({ userId }, "Fetching user profile");

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      authLogger.warn({ userId }, "User profile not found");
      throw ApiError.notFound("User not found");
    }

    authLogger.debug({ userId, email: user.email }, "User profile fetched successfully");
    return user;
  },
};
