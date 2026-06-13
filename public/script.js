const socket = io();
const localVideo = document.getElementById('localVideo');
let localStream;
let peerConnection;

const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// Encender cámara
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = stream;
    });

// Unirse a la sala
document.getElementById('joinButton').addEventListener('click', () => {
    const roomId = document.getElementById('roomIdDisplay').innerText.replace('Código de sala: ', '');
    socket.emit('join-room', roomId);
    alert("Sala creada. Esperando al otro dispositivo...");
});

// Señalización: cuando el servidor nos avisa de otro usuario
socket.on('user-connected', () => {
    console.log("Otro usuario detectado. Iniciando conexión...");
    // Aquí se iniciaría el intercambio de vídeo WebRTC
});