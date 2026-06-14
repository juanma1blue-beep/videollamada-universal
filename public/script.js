const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;

async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: {
                echoCancellation: true,    // Filtro contra eco
                noiseSuppression: true,   // Filtro contra el "grillo"
                autoGainControl: true,    // Evita saturación
                latency: 0                // Prioridad velocidad
            } 
        });
        localVideo.srcObject = localStream;
        localVideo.muted = true; // IMPRESCINDIBLE: Tu voz nunca sale por tu altavoz
    } catch (err) { alert("Error de cámara: " + err.message); }
}

function toggleFS(id) {
    document.getElementById(id).requestFullscreen();
}

// Función para colgar
function endCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    socket.disconnect();
    window.location.reload(); // Recarga para limpiar la memoria
}

document.getElementById('volumeRemote').addEventListener('input', (e) => {
    remoteVideo.volume = e.target.value;
});

startCamera();
