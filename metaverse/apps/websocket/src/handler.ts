import prisma from "@repo/db";
import { WebSocket } from "ws";
import { JoinMessage, Movement } from "./types";
import { verifyToken } from "./verifyJwt";

interface Cordinates {
  x: number;
  y: number;
}

interface SpaceUser {
  ws: WebSocket;
  position: Cordinates;
  spaceId: string;
}

interface spaceDimensions {
  width: number;
  height: number;
}

type UserMap = {
  [userId: string]: SpaceUser;
}

let spaces = new Map<string, UserMap>();
let spaceDimensions = new Map<string, spaceDimensions>();
let wsToSpaceId = new Map<WebSocket, string>();

const isValidMove = (
  xStep: number,
  yStep: number,
  theSpace: string,
  ws: WebSocket,
  currentPosition: Cordinates
) => {
  const widthInDimension = spaceDimensions.get(theSpace)?.width;
  const heightInDimension = spaceDimensions.get(theSpace)?.height;

  if (!widthInDimension || !heightInDimension) {
    return false;
  }

  if (xStep >= widthInDimension || yStep >= heightInDimension || xStep < 0 || yStep < 0) {
    return false;
  }

  const xDiff = Math.abs(xStep - currentPosition.x);
  const yDiff = Math.abs(yStep - currentPosition.y);

  if (xDiff > 1 || yDiff > 1) {
    return false;
  }

  return true;
};

const addUserToSpace = (spaceId: string, userId: string, user: SpaceUser) => {
  if (!spaces.has(spaceId)) {
    spaces.set(spaceId, {});
  }
  const spaceUsers = spaces.get(spaceId)!;
  spaceUsers[userId] = user;
}

const removeUserFromSpace = (spaceId: string, userId: string) => {
  const spaceUsers = spaces.get(spaceId);
  if (spaceUsers) {
    delete spaceUsers[userId];
    if (Object.keys(spaceUsers).length === 0) {
      spaces.delete(spaceId);
    }
  }
}

export const handleCloseConnection = () =>{
  
}

export const handleJoinSpace = async (data: JoinMessage, ws: WebSocket) => {
  try {
    const userInfo = verifyToken(data.payload.token) as {
      userId: string;
      username: string;
    };
    const spaceId = data.payload.spaceId;
    const spaceExist = await prisma.space.findUnique({
      where: {
        id: spaceId,
      },
      select: {
        width: true,
        height: true,
      },
    });

    if (!spaceExist) {
      return ws.send(
        JSON.stringify({
          type: "error",
          payload: { message: "Space not found" },
        })
      );
    }

    const dimension: spaceDimensions = {
      width: spaceExist.width,
      height: spaceExist.height,
    };

    spaceDimensions.set(spaceId, dimension);
    wsToSpaceId.set(ws, spaceId);

    const spaceUsers = spaces.get(spaceId) || {};
    const existingUsers = Object.entries(spaceUsers).filter(([id]) => id !== userInfo.userId);

    const spawn = {
      x: Math.floor(Math.random() * spaceExist.width),
      y: Math.floor(Math.random() * spaceExist.height),
    };

    const newUser: SpaceUser = {
      ws,
      position: spawn,
      spaceId: spaceId,
    };

    addUserToSpace(spaceId, userInfo.userId, newUser);

    ws.send(JSON.stringify({
      type: "space-joined",
      payload: {
        spawn,
        users: existingUsers.map(([userId, user]) => ({
          userId,
          position: user.position
        }))
      }
    }));

    existingUsers.forEach(([_, user]) => {
      user.ws.send(
        JSON.stringify({
          type: "user-joined",
          payload: {
            userId: userInfo.userId,
            x: spawn.x,
            y: spawn.y,
          },
        })
      );
    });

    ws.on("close", () => {
      const spaceUsers = spaces.get(spaceId);
      if (spaceUsers) {
        removeUserFromSpace(spaceId, userInfo.userId);
        
        Object.values(spaceUsers).forEach((user) => {
          user.ws.send(
            JSON.stringify({
              type: "user-left",
              payload: {
                userId: userInfo.userId
              },
            })
          );
        });
      }
      wsToSpaceId.delete(ws);
    });

  } catch (error) {
    console.error("Join space error:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        payload: { message: "Failed to join space" },
      })
    );
  }
};

export const handleMove = async (data: Movement, ws: WebSocket) => {
  const xStep = Number(data.payload.x);
  const yStep = Number(data.payload.y);
  const theSpace = wsToSpaceId.get(ws);

  if (!theSpace) {
    return;
  }

  const spaceUsers = spaces.get(theSpace);
  if (!spaceUsers) {
    return;
  }

  const movingUser = Object.entries(spaceUsers).find(
    ([_, user]) => user.ws === ws
  );

  if (!movingUser) {
    return;
  }

  const [userId, user] = movingUser;

  if (!isValidMove(xStep, yStep, theSpace, ws, user.position)) {
    return ws.send(JSON.stringify({
      type: "movement-rejected",
      payload: {
        x: user.position.x,
        y: user.position.y
      }
    }));
  }

  user.position = {
    x: xStep,
    y: yStep
  };

  Object.values(spaceUsers).forEach((otherUser) => {
    if (otherUser.ws !== ws) {
      otherUser.ws.send(JSON.stringify({
        type: "movement",
        payload: {
          userId,
          x: xStep,
          y: yStep
        }
      }));
    }
  });
};