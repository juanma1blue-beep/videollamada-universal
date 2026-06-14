const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;

// Generar código aleatorio al cargar
const randomRoom = Math.random().toString(36).substring(2, 9);
document.getElementById('roomInput').value = randomRoom;
document.getElementById('roomDisplay').innerText = "Tu código: " + randomRoom;

async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, latency: 0 } 
        });
        localVideo.srcObject = localStream;
        localVideo.muted = true; // Evita tu propio eco
    } catch (err) { alert("Error de cámara: " + err.message); }
}

function joinRoom() {
    const roomId = document.getElementById('roomInput').value;
    socket.emit('join-room', roomId);
    alert("Te has unido a la sala: " + roomId);
}

function toggleFS(id) { document.getElementById(id).requestFullscreen(); }

function endCall() {
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    socket.disconnect();
    window.location.reload();
}

document.getElementById('volumeRemote').addEventListener('input', (e) => {
    remoteVideo.volume = e.target.value;
});

startCamera();
