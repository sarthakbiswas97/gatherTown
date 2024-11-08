// reset whole database
import { Request, Response } from "express";
import prisma from "@repo/db";
import {} from "../types/index";


export const resetDatabase = async (req: Request, res: Response) => {

    try {
        // Delete in correct order to handle foreign key constraints
        await prisma.$transaction(async (prisma) => {
            // 1. First delete spaceElements (has references to Space and Element)
            await prisma.spaceElements.deleteMany({});

            // 2. Delete MapElements (has references to Map and Element)
            await prisma.mapElements.deleteMany({});

            // 3. Delete Spaces (has reference to User)
            await prisma.space.deleteMany({});

            // 4. Delete Maps
            await prisma.map.deleteMany({});

            // 5. Delete Elements
            await prisma.element.deleteMany({});

            // 6. Delete Users (has reference to Avatar)
            await prisma.user.deleteMany({});

            // 7. Finally delete Avatars
            await prisma.avatar.deleteMany({});
        });

        return res.status(200).json({
            message: "Database reset successful",
            status: "All data has been deleted"
        });

    } catch (error) {
        console.error("Database reset error:", error);
        return res.status(500).json({
            error: "Failed to reset database",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

// If you want to add admin-only middleware
export const resetDatabaseAdmin = async (req: Request, res: Response):Promise<any> => {
    if (req.role !== 'admin') {
        return res.status(403).json({
            error: "Unauthorized. Admin access required"
        });
    }
    
    return resetDatabase(req, res);
};