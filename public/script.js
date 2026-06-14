const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

// Configuración de latencia baja y supresión de ruido avanzada
const constraints = {
    video: true,
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        latency: 0 // Intentar minimizar el retardo
    }
};

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localVideo.srcObject = stream;
        localVideo.muted = true; // Vital para evitar el retorno y eco
    } catch (err) { console.error("Error Pro Audio:", err); }
}

function toggleFS(id) {
    const elem = document.getElementById(id);
    if (elem.requestFullscreen) elem.requestFullscreen();
}

// Control de volumen profesional
document.getElementById('volumeRemote').addEventListener('input', (e) => {
    remoteVideo.volume = e.target.value;
});

startCamera();
const newId = Math.random().toString(36).substring(2, 9);
document.getElementById('room-id-display').innerText = "Tu Código: " + newId;
