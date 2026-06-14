const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;
let peerConnection;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// --- FUNCIÓN: Generar ID y mostrarlo ---
function generateRandomRoomId() { return Math.random().toString(36).substring(2, 9); }
function setRoomId() {
    const roomInput = document.getElementById('roomInput');
    const displayDiv = document.getElementById('room-id-display');
    const newId = generateRandomRoomId();
    if (roomInput) roomInput.value = newId;
    if (displayDiv) displayDiv.innerText = "Tu código de sala: " + newId;
}

// --- LÓGICA WEBRTC ---
async function startCamera() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
}

function createPeerConnection(targetId) {
    peerConnection = new RTCPeerConnection(config);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) socket.emit('ice-candidate', { target: targetId, candidate: event.candidate });
    };
    
    peerConnection.ontrack = (event) => { remoteVideo.srcObject = event.streams[0]; };
    return peerConnection;
}

function joinRoom() {
    const roomId = document.getElementById('roomInput').value;
    if (!roomId) return alert("Introduce un código");
    socket.emit('join-room', roomId);
    document.getElementById('room-id-display').innerText = "Conectado a: " + roomId;
}

socket.on('user-connected', async (userId) => {
    const pc = createPeerConnection(userId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', { target: userId, offer });
});

socket.on('offer', async (payload) => {
    const pc = createPeerConnection(payload.sender);
    await pc.setRemoteDescription(payload.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('answer', { target: payload.sender, answer });
});

socket.on('answer', async (payload) => {
    await peerConnection.setRemoteDescription(payload.answer);
});

socket.on('ice-candidate', async (payload) => {
    await peerConnection.addIceCandidate(payload.candidate);
});

startCamera();
setRoomId();
