import prisma from "@repo/db";
import { WebSocket } from "ws";
import { JoinMessage, Movement } from "./types";
import { verifyToken } from "./verifyJwt";

interface Position {
    x: number,
    y: number
}

interface SpaceUser {
    ws: WebSocket,
    userId: string,
    position: Position,
    spaceId: string
}


let spaces = new Map<string, SpaceUser[]>();

export const handleJoinSpace = async (data: JoinMessage, ws: WebSocket) => {
    try {
        const userInfo = verifyToken(data.payload.token) as {
            userId: string,
            username: string
        }

        // const userId = userInfo.userId;
        // const username = userInfo.username;
        
        // console.log(`userInfo`, {
        //     userId,
        //     username
        // });
        
        const spaceExist = await prisma.space.findUnique({
            where: {
                id: data.payload.spaceId
            }
        });
        

        if (!spaceExist) {
            ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Space not found' }
            }));
            return;
        }

        const spaceId = data.payload.spaceId;
        const spaceUsers = spaces.get(spaceId) || [];
        
        const spawn = {
            x: Math.floor(Math.random() * 100),
            y: Math.floor(Math.random() * 100)
        }

        const newUser: SpaceUser = {
            ws,
            userId: userInfo.userId,
            position: spawn,
            spaceId: spaceId
        }
        
        spaces.set(spaceId, [...spaceUsers, newUser]);

        ws.send(JSON.stringify({
            type: 'space-joined',
            payload: {
                spawn,
                users: spaceUsers.map(u => ({
                    userId: u.userId,
                    position: u.position
                }))
            }
        }));

        spaceUsers.forEach(user => {
            user.ws.send(JSON.stringify({
                type: 'user-joined',
                payload: {
                    userId: userInfo.userId,
                    x: spawn.x,
                    y: spawn.y
                }
            }));
        });

        ws.on('close', () => {
            const users = spaces.get(spaceId);
            if (users) {
                spaces.set(spaceId, users.filter(u => u.userId !== userInfo.userId));
                users.forEach(user => {
                    if (user.userId !== userInfo.userId) {
                        user.ws.send(JSON.stringify({
                            type: 'user-left',
                            payload: { userId: userInfo.userId }
                        }));
                    }
                });
            }
        });

    } catch (error) {
        console.error('Join space error:', error);
        ws.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Failed to join space' }
        }));
    }
}

export const handleMove =async (data: Movement, ws: WebSocket) => {
    const xStep = data.payload.x;
    const yStep = data.payload.y;

    // console.log(`----------------------------`);
    // console.log(`spaces`, spaces);

    // need particular spaces dimension
    
    // need users current position in order to validate move
}