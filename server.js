import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", (_, res) => res.send(html));

/* =======================
   ROOMS MEMORY (NO DB)
======================= */
const rooms = new Map();

function getRoom(id){
  if(!rooms.has(id)) rooms.set(id, new Set());
  return rooms.get(id);
}

/* =======================
   SOCKET SIGNAL SERVER
======================= */
io.on("connection", (socket) => {

  socket.on("join-room", ({ roomId }) => {

    const room = getRoom(roomId);

    if(room.size >= 2){
      socket.emit("room-full");
      return;
    }

    socket.roomId = roomId;
    room.add(socket.id);
    socket.join(roomId);

    socket.to(roomId).emit("peer-ready");

    socket.on("disconnect", () => {
      room.delete(socket.id);
      socket.to(roomId).emit("peer-left");
    });
  });

  socket.on("signal", ({ roomId, data }) => {
    socket.to(roomId).emit("signal", data);
  });

});

/* =======================
   FRONTEND (FULL CLIENT)
======================= */

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>RAIDCALL FULL PRODUCTION</title>

<style>
body{
  margin:0;
  font-family:sans-serif;
  background:#0f0f12;
  color:white;
  display:flex;
}

#panel{
  width:260px;
  background:#1c1d22;
  padding:10px;
}

input,button{
  width:100%;
  padding:10px;
  margin-top:5px;
}

button{
  background:#5865f2;
  border:none;
  color:white;
  cursor:pointer;
}

#main{
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:center;
}

video{
  width:320px;
  margin:10px;
  border-radius:10px;
  background:black;
}

#status{
  margin-top:10px;
}
</style>
</head>

<body>

<div id="panel">

  <h3>RAIDCALL PRO</h3>

  <input id="room" placeholder="Room ID">

  <button onclick="createRoom()">Create Room</button>
  <button onclick="join()">Join Room</button>

  <div id="status">Offline</div>

</div>

<div id="main">

  <video id="local" autoplay muted></video>
  <video id="remote" autoplay></video>

</div>

<script src="/socket.io/socket.io.js"></script>

<script>
const socket = io();

let roomId;
let pc;
let stream;

/* ICE SERVERS (STUN + TURN READY) */
const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },

    // TURN (PRODUCTION MUST HAVE)
    // {
    //   urls: "turn:YOUR_VPS_IP:3478",
    //   username: "user",
    //   credential: "pass"
    // }
  ]
};

/* CREATE ROOM */
function createRoom(){
  roomId = Math.random().toString(36).slice(2,8);
  document.getElementById("room").value = roomId;
}

/* JOIN ROOM */
async function join(){

  roomId = document.getElementById("room").value;

  socket.emit("join-room", { roomId });

  stream = await navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
  });

  document.getElementById("local").srcObject = stream;
}

/* PEER CREATION */
function createPeer(isOffer){

  if(pc) pc.close();

  pc = new RTCPeerConnection(config);

  stream.getTracks().forEach(t => pc.addTrack(t, stream));

  pc.ontrack = (e) => {
    document.getElementById("remote").srcObject = e.streams[0];
  };

  /* 🔁 STABILITY */
  pc.oniceconnectionstatechange = () => {
    if(pc.iceConnectionState === "failed"){
      pc.restartIce();
    }
  };

  pc.onicecandidate = (e) => {
    if(e.candidate){
      socket.emit("signal", {
        roomId,
        data:{ candidate:e.candidate }
      });
    }
  };

  if(isOffer){
    pc.createOffer()
      .then(o => pc.setLocalDescription(o))
      .then(() => {
        socket.emit("signal", {
          roomId,
          data:{ offer:pc.localDescription }
        });
      });
  }
}

/* SIGNAL FLOW */
socket.on("peer-ready", () => {
  createPeer(true);
});

socket.on("signal", async (data) => {

  if(data.offer){
    createPeer(false);
    await pc.setRemoteDescription(data.offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("signal", {
      roomId,
      data:{ answer:pc.localDescription }
    });
  }

  if(data.answer){
    await pc.setRemoteDescription(data.answer);
  }

  if(data.candidate){
    try{
      await pc.addIceCandidate(data.candidate);
    }catch(e){}
  }
});
</script>

</body>
</html>
`;

server.listen(3000, () => {
  console.log("RAIDCALL FULL PRODUCTION READY");
});
