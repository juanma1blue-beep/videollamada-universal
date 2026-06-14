const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const volumeLocal = document.getElementById('volumeLocal');
const volumeRemote = document.getElementById('volumeRemote');
const valLocal = document.getElementById('valLocal');
const valRemote = document.getElementById('valRemote');
let localStream;

function generateRandomRoomId() {
    return Math.random().toString(36).substring(2, 9);
}

function setRoomId() {
    const roomInput = document.getElementById('roomInput');
    const displayDiv = document.getElementById('room-id-display');
    const newId = generateRandomRoomId();
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

// Control Volumen Local con formato %
volumeLocal.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    localVideo.volume = vol;
    valLocal.innerText = Math.round(vol * 100) + "%";
});

// Control Volumen Remoto con formato %
volumeRemote.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    remoteVideo.volume = vol;
    valRemote.innerText = Math.round(vol * 100) + "%";
});

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

startCamera();
setRoomId();
