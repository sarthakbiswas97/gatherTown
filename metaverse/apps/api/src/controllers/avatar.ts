import { Request, Response } from "express";
import prisma from "@repo/db";
import {} from "../types/index";

export const metadata = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(403);
    }
    const avatarId: string = req.body.avatarId;

    if (!avatarId) {
      return res.status(403).send(`Invalid ${avatarId}`);
    }

    const avatarExists = await prisma.avatar.findUnique({
      where: { id: avatarId },
    });

    if (!avatarExists) {
      return res.status(400).json({
        message: "Avatar not found",
      });
    }

    const userData = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarId: avatarId,
      },
    });

    res.status(200).json({
      message: userData,
    });
  } catch (error) {
    console.error("metadata error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "metadata error",
    });
  }
};

export const getAllAvatars = async (req: Request, res: Response) => {
  try {
    const allAvatars = await prisma.avatar.findMany();
    res.status(200).json({
      avatars: allAvatars,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const bulkUserAvatars = async (req: Request, res: Response) => {
  try {
    const ids = req.query.ids as string;
    const userIds = ids.replace(/[\[\]]/g, "").split(",");

    const avatars = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        avatarId: true,
        avatar: {
          select: {
            imageUrl: true,
            name: true,
          },
        },
      },
    });

    const responseData = {
      avatars: avatars.map((user) => ({
        userId: user.id,
        avatarId: user.avatarId,
        imageUrl: user.avatar?.imageUrl,
        name: user.avatar?.name,
      })),
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("error in bulkUserAvatars:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
