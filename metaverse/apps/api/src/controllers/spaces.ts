import { Request, Response } from "express";
import prisma from "@repo/db";
import {} from "../types/index";

export const createSpace = async (req: Request, res: Response) => {
  const creatorId = req.id;
  if (!creatorId) {
    return res.status(401).json({ error: "Authorization required" });
  }

  try {
    const { name, dimensions, mapId } = req.body;

    if (!name || !dimensions) {
      return res.status(400).json({ error: "Missing required inputs" });
    }

    const [widthStr, heightStr] = dimensions.split("x");
    const width = parseInt(widthStr);
    const height = parseInt(heightStr);

    const spaceData: any = {
      name,
      width,
      height,
      creatorId,
    };

    if (mapId) {
      const mapWithElements = await prisma.map.findUnique({
        where: { id: mapId },
        include: { mapElements: true },
      });

      if (!mapWithElements) {
        return res.status(404).json({ error: "Map not found" });
      }

      spaceData.elements = {
        create: mapWithElements.mapElements.map((elem) => ({
          elementId: elem.elementId,
          x: elem.x || 0,
          y: elem.y || 0,
        })),
      };
    }

    const spaceInfo = await prisma.space.create({
      data: spaceData,
    });

    return res.status(200).json({
      spaceId: spaceInfo.id,
    });
  } catch (error) {
    console.error("Error creating space:", error);
    return res.status(500).json({ error: "Failed to create space" });
  }
};

export const delSpace = async (req: Request, res: Response) => {
  const userId = req.id;
  const spaceId = req.params.spaceId;
  
  if (!spaceId) {
    return res.status(400).json({
      error: "spaceId required",
    });
  }

  try {
    const spaceExists = await prisma.space.findUnique({
      where: {
        id: spaceId
      }
    });

    if (!spaceExists) {
      return res.status(400).json({
        error: "Space not found"
      });
    }

    const userOwnsSpace = await prisma.space.findFirst({
      where: {
        AND: [
          { id: spaceId },
          { creatorId: userId }
        ]
      }
    });

    if (!userOwnsSpace) {
      return res.status(403).json({
        error: "Unauthorized access"
      });
    }

    const spaceElements = await prisma.spaceElements.findMany({
      where: {
        spaceId: spaceId,
      },
    });

    let deletedElements;
    if (spaceElements.length > 0) {
      deletedElements = await prisma.spaceElements.deleteMany({
        where: {
          spaceId: spaceId,
        },
      });
    }

    const deletedSpace = await prisma.space.delete({
      where: {
        id: spaceId,
      },
    });

    return res.status(200).json({deletedElements});
  } catch (error) {
    console.error("delete space error:", error);
    return res.status(500).json({
      error: "failed to delete space",
    });
  }
};

export const getAllSpaces = async (req: Request, res: Response) => {
  const userId = req.id;

  try {
      const allSpaces = await prisma.space.findMany({
          where: {
              creatorId: userId
          }
      });

      return res.status(200).json({
          spaces: allSpaces
      });
  } catch (error) {
      console.error("Error spaces:", error);
      return res.status(500).json({
          error: "Failed to fetch spaces"
      });
  }
};

export const getSpecificSpace = async (req: Request, res: Response) => {
  const spaceId = req.params.spaceId;
  if (!spaceId) {
    return res.status(400).json({
      error: "Space ID is required",
    });
  }

  try {
    const spaceExists = await prisma.space.findUnique({
      where: {
        id: spaceId
      }
    });

    if (!spaceExists) {
      return res.status(400).json({
        error: "Space not found"
      });
    }

    const spaceInfo = await prisma.space.findUnique({
      where: { id: spaceId },
      select: {
        width: true,
        height: true,
        elements: {
          select: {
            id: true,
            x: true,
            y: true,
            element: {
              select: {
                id: true,
                imageUrl: true,
                static: true,
                height: true,
                width: true,
              },
            },
          },
        },
      },
    });

    const response = {
      dimensions: `${spaceInfo!.width}x${spaceInfo!.height}`,
      elements: spaceInfo!.elements.map((elem) => ({
        id: elem.id,
        element: {
          id: elem.element.id,
          imageUrl: elem.element.imageUrl,
          static: elem.element.static,
          height: elem.element.height,
          width: elem.element.width,
        },
        x: elem.x,
        y: elem.y,
      })),
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching space:", error);
    return res.status(500).json({
      error: "Failed to fetch space details",
    });
  }
};

export const addElement = async (req: Request, res: Response) => {
  const { elementId, spaceId, x, y } = req.body;
  if (!elementId || !spaceId || !x || !y) {
    return res.status(400).send(`Invalid input`);
  }
  if (typeof x != "number" || typeof y != "number") {
    return res.status(400).send(`Invalid cordinates type`);
  }

  const isElementId = await prisma.element.findUnique({
    where: {
      id: elementId,
    },
  });
  if (!isElementId) {
    return res.status(400).send(`element id not found`);
  }

  const isSpaceId = await prisma.space.findUnique({
    where: {
      id: spaceId,
    },
  });
  if (!isSpaceId) {
    return res.status(400).send(`space id not found`);
  }

  const dimension = await prisma.space.findUnique({
    where: {
      id: spaceId,
    },
    select: {
      width: true,
      height: true,
    },
  });
  const width = dimension?.width;
  const height = dimension?.height;

  if (x > width! || y > height!) {
    return res.status(400).send(`Invalid cordinates`);
  }

  const addingElement = await prisma.spaceElements.create({
    data: {
      elementId,
      spaceId,
      x,
      y,
    },
  });

  res.status(200).json({
    spaceElement: addingElement.id,
  });
};

export const deleteElement = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).send(`id not found`);
  }

  const elementExists = await prisma.spaceElements.findMany({
    where:{
      id
    }
  })

  if(!elementExists){
    return res.status(400).send(`element does not exists`);
  }

  const deleteSpaceElement = await prisma.spaceElements.delete({
    where: {
      id
    },
  });

  res.status(200).json({elements:[deleteSpaceElement]});
};

export const availableElements = async (res: Response) => {
  const allElements = await prisma.element.findMany({
    select: {
      id: true,
      imageUrl: true,
      width: true,
      height: true,
      static: true,
    },
  });

  if (!allElements) {
    res.status(400).send(`no eelement found`);
  }

  res.status(200).json({
    elements: allElements,
  });
};
