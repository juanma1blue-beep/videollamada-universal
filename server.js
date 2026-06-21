import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.static("public"));

const rooms = new Map();

io.on("connection", (socket) => {

    socket.on("join", (roomId) => {

        if (!roomId) return;

        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }

        const room = rooms.get(roomId);

        if (room.size >= 2) {
            socket.emit("full");
            return;
        }

        room.add(socket.id);
        socket.join(roomId);

        socket.roomId = roomId;

        socket.to(roomId).emit("peer-joined");

        socket.on("disconnect", () => {
            room.delete(socket.id);
            socket.to(roomId).emit("peer-left");

            if (room.size === 0) {
                rooms.delete(roomId);
            }
        });
    });

    socket.on("signal", ({ roomId, data }) => {
        socket.to(roomId).emit("signal", data);
    });

});

server.listen(process.env.PORT || 3000, () => {
    console.log("V5 STABLE PRO RUNNING");
});
