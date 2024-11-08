import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "@repo/db";

dotenv.config()
const SECRET_KEY = process.env.JWT_SECRET_KEY ?? ""

export const authenticateToken = async (req: Request, res: Response, next: Function) => {
    
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            res.status(403).json({ error: "No authorization header" });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(403).json({ error: "No token provided" });
            return;
        }

        try {
            const userInfo = jwt.verify(token, SECRET_KEY) as { userId: string, username: string };

            const userdetails = await prisma.user.findUnique({
                where:{
                    username: userInfo.username
                },
                select:{
                    id: true,
                    role: true
                }
            })

            if(!userdetails){
                res.status(403).json({ error: "User not found" });
                return;
            }
            if(!userdetails.role){
                res.status(403).json({ error: "role not defined" });
                return;
            }

            req.id = userdetails?.id
            req.role = userdetails?.role

            next();
        } catch (error) {
            res.status(403).json({ error: "Invalid token" });
            return;
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        return;
    }
};

export const isAdmin = async (req: Request, res: Response, next: Function) => {
    if (req.role !== "admin") {
        res.status(400).json({ error: "Admin access required" });
        return;
    }
    next();
};