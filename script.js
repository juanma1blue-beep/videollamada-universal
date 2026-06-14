const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;

// Obtener acceso a la cámara y micro
async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
    } catch (error) {
        console.error("Error al acceder a la cámara:", error);
    }
}

function joinRoom() {
    const roomId = document.getElementById('roomInput').value;
    if (roomId) {
        socket.emit('join-room', roomId);
        alert("Te has unido a la sala: " + roomId);
    }
}

socket.on('user-connected', (userId) => {
    console.log("Usuario remoto conectado: " + userId);
    alert("¡Otro dispositivo se ha unido a la sala!");
});

// Iniciar cámara al cargar la página
startCamera();