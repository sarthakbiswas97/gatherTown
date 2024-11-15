import { Request, Response } from "express";
import prisma from "@repo/db";
import { SignupSchema, SigninSchema } from "../utils/signupValidation";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const saltRounds = 10;
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const TOKEN_EXPIRY = "24h";

const userExistence = new Set();

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, password, type } = req.body;

    const signupDetails = { username, password, type };
    
    const validationResult = SignupSchema.safeParse(signupDetails);
    if (!validationResult.success) {
      return res.status(400).json({
        message: JSON.parse(validationResult.error.message),
      });
    }

    if (userExistence.has(username)) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    const usernameCheck = await prisma.user.findUnique({
      where: { username },
    });

    if (usernameCheck) {
      userExistence.add(username);
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(signupDetails.password, saltRounds);
    if (!hashedPassword) {
      return res.status(400).send(`Error hashing password`);
    }

    const userInfo = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: type,
      },
    });

    userExistence.add(username);
    
    return res.status(200).json({
      message: "User created successfully",
      userId: userInfo.id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(400).json({
      error: "Internal server error",
      message: "Signup error",
    });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if(!username || !password){
      return res.status(400);
    }

    const signinDetails = { username, password };
    const validationResult = SigninSchema.safeParse(signinDetails);
    if (!validationResult.success) {
      return res.status(400).json({
        message: JSON.parse(validationResult.error.message),
      });
    }

    if (userExistence.size !== 0 && !userExistence.has(username)) {
      return res.status(403).json({
        message: "Invalid username or password",
      });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.password) {
      return res.status(403).json({
        message: "Invalid username or password",
      });
    }

    userExistence.add(username);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      SECRET_KEY!,
      {
        expiresIn: TOKEN_EXPIRY,
      }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Authentication signin error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Signin error",
    });
  }
};
