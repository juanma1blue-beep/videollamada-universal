const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const volumeLocal = document.getElementById('volumeLocal');
const volumeRemote = document.getElementById('volumeRemote');
const valLocal = document.getElementById('valLocal');
const valRemote = document.getElementById('valRemote');
let localStream;

// Función para pantalla completa
function toggleFS(id) {
    const elem = document.getElementById(id);
    if (elem.requestFullscreen) elem.requestFullscreen();
}

async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
    } catch (error) { console.error("Error cámara:", error); }
}

// Controles de volumen con %
volumeLocal.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    localVideo.volume = vol;
    valLocal.innerText = Math.round(vol * 100) + "%";
});

volumeRemote.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    remoteVideo.volume = vol;
    valRemote.innerText = Math.round(vol * 100) + "%";
});

function joinRoom() {
    const roomId = document.getElementById('roomInput').value;
    if (roomId) socket.emit('join-room', roomId);
    else alert("Introduce un código.");
}

socket.on('user-connected', (userId) => console.log("Usuario remoto: " + userId));

// Inicialización
startCamera();
const newId = Math.random().toString(36).substring(2, 9);
document.getElementById('roomInput').value = newId;
document.getElementById('room-id-display').innerText = "Tu código de sala: " + newId;
