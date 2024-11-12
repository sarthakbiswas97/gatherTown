import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
dotenv.config();

const SECRET_KEY = "helloMetaverse"

export const verifyToken = (authToken: string) => {
    try {
        const userInfo = jwt.verify(authToken, SECRET_KEY) as {
            userId: string,
            username: string
        };
        return userInfo;
    } catch (error) {
        console.log(`token verification error`);
        throw error;
    }
}