const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;

// --- NUEVA FUNCIÓN: Generar código de sala aleatorio ---
function generateRandomRoomId() {
    return Math.random().toString(36).substring(2, 9); // Genera un código de 7 caracteres
}

// --- NUEVA FUNCIÓN: Asignar ID al cargar ---
function setRoomId() {
    const roomInput = document.getElementById('roomInput');
    if (roomInput && !roomInput.value) {
        roomInput.value = generateRandomRoomId();
    }
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
        // Ocultar botones de inicio para mejorar la interfaz
    } else {
        alert("Por favor, ingresa o genera un código de sala.");
    }
}

socket.on('user-connected', (userId) => {
    console.log("Usuario remoto conectado: " + userId);
    // Aquí es donde en el futuro pondremos la lógica para mostrar el vídeo remoto
});

// Iniciar cámara al cargar la página
startCamera();
// Llamar a la función para poner un ID aleatorio automáticamente
setRoomId();
