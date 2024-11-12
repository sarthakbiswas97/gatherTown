import WebSocket, {WebSocketServer} from "ws";
import http from "http";
import { handleJoinSpace, handleMove } from "./handler";

const server = http.createServer();
const wss = new WebSocketServer({server});


wss.on("connection", (ws) => {
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data.toString());
            const {type} = message;

            if (type === "join") {
                await handleJoinSpace(message, ws);
            } else if(type === "move"){
                await handleMove(message,ws)
            }
        } catch (error) {
            console.error('Message handling error:', error);
        }
    });

    console.log(`hello from websocket`);
    
});

server.listen(8080, ()=>{
    console.log(`websocket listening to port 8080`);
});