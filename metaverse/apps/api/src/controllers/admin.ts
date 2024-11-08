import { Request, Response } from "express";
import prisma from "@repo/db";
import {} from "../types/index";

export const createElement = async (req: Request, res: Response) => {
  if (req.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { imageUrl, width, height, staticType } = req.body;
  
  try {
    const element = await prisma.element.create({
      data: {
        imageUrl,
        width,
        height,
        static: Boolean(staticType),
      },
    });
    res.status(200).json({ id: element.id });
  } catch (error) {
    console.log(error);
    res.status(500).send(`Internal server error`);
  }
};

export const updateElement = async (req: Request, res: Response) => {
  if (req.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  const elementId = req.params.elementId;
  const { imageUrl } = req.body;

  if (!elementId) {
    return res.status(400).json({ error: "Element ID is required" });
  }

  try {
    const element = await prisma.element.findUnique({
      where: {
        id: elementId
      }
    });

    if (!element) {
      return res.status(404).json({ error: `Element with ID ${elementId} not found` });
    }

    const updatedElement = await prisma.element.update({
      where: {
        id: elementId
      },
      data: {
        imageUrl,
      },
    });
    
    return res.status(200).json({
      message: `imageUrl updated successfully`,
      id: updatedElement.id
    });
  } catch (error) {
    console.log("Error details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createAvatar = async (req: Request, res: Response) => {
  if (req.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  const { imageUrl, name } = req.body;

  try {
    const avatarInfo = await prisma.avatar.create({
      data: {
        imageUrl,
        name,
      },
    });
    
    return res.status(200).json({
      avatarId: avatarInfo.id,
    });
  } catch (error) {
    res.status(500).send(`Internal server error`);
  }
};

export const createMap = async (req: Request, res: Response):Promise<any> => {
  if (req.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  const { thumbnail, dimensions, name, defaultElements } = req.body;
  const dimen = dimensions.split("x");
  const width = dimen[0];
  const height = dimen[1];
  const typeWidth = Number(width);
  const typeHeight = Number(height);


  try {
    const isValid = defaultElements.every(
      (elem: { elementId: any; x: any; y: any }) => {
        return (
          typeof elem.elementId === "string" &&
          typeof elem.x === "number" &&
          typeof elem.y === "number"
        );
      }
    );

    if (!isValid) {
      console.log(`Invalid defaultElements`);
      return res.status(400).send(`Invalid defaultElements`);
    }
    try {
      const mapInfo = await prisma.map.create({
        data: {
          thumbnail,
          width: typeWidth,
          height: typeHeight,
          name,
          mapElements: {
            create: defaultElements,
          },
        },
      });

      res.status(200).json({
        id: mapInfo.id,
      });
      return
    } catch (error) {
      console.log(error);
      res.status(500).send(`Map creation error`);
      return
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(`Internal server error`);
  }
};
