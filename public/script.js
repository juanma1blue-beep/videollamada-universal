const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;

// --- FUNCIÓN: Generar código de sala ---
function generateRandomRoomId() {
    return Math.random().toString(36).substring(2, 9);
}

// --- FUNCIÓN: Asignar ID y mostrarlo en la interfaz ---
function setRoomId() {
    const roomInput = document.getElementById('roomInput');
    const displayDiv = document.getElementById('room-id-display');
    const newId = generateRandomRoomId();
    
    // Ponemos el ID en el input y en la cajita gris
    if (roomInput) roomInput.value = newId;
    if (displayDiv) displayDiv.innerText = "Tu código de sala: " + newId;
}

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
        console.log("Unido a la sala privada: " + roomId);
    } else {
        alert("Por favor, ingresa o genera un código de sala.");
    }
}

socket.on('user-connected', (userId) => {
    console.log("Usuario remoto conectado: " + userId);
});

// Iniciar cámara y generar ID al cargar la página
startCamera();
setRoomId();
