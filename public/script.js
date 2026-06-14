const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const volumeRemote = document.getElementById('volumeRemote');
let localStream;

// Generar ID de sala
function generateRandomRoomId() {
    return Math.random().toString(36).substring(2, 9);
}

// Mostrar ID
function setRoomId() {
    const roomInput = document.getElementById('roomInput');
    const displayDiv = document.getElementById('room-id-display');
    const newId = generateRandomRoomId();
    if (roomInput) roomInput.value = newId;
    if (displayDiv) displayDiv.innerText = "Tu código de sala: " + newId;
}

// Iniciar cámara
async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
    } catch (error) {
        console.error("Error al acceder a la cámara:", error);
    }
}

// Controlar volumen remoto
volumeRemote.addEventListener('input', (e) => {
    remoteVideo.volume = e.target.value;
});

// Unirse a sala
function joinRoom() {
    const roomId = document.getElementById('roomInput').value;
    if (roomId) {
        socket.emit('join-room', roomId);
    } else {
        alert("Por favor, ingresa o genera un código de sala.");
    }
}

socket.on('user-connected', (userId) => {
    console.log("Usuario remoto conectado: " + userId);
});

// Ejecución inicial
startCamera();
setRoomId();
