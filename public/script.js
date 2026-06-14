const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

// Generación inmediata del código
window.onload = function() {
    const randomRoom = Math.random().toString(36).substring(2, 9);
    document.getElementById('roomInput').value = randomRoom;
    document.getElementById('roomDisplay').innerText = "Tu código: " + randomRoom;
};

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: {
                echoCancellation: true,  // Obligatorio para eco
                noiseSuppression: true, // Obligatorio para "grillo"
                autoGainControl: true,
                latency: 0 
            } 
        });
        localVideo.srcObject = stream;
        localVideo.muted = true; // Mute local para evitar latencia mental y eco
    } catch (err) { console.error("Error:", err); }
}

function joinRoom() {
    const roomId = document.getElementById('roomInput').value;
    socket.emit('join-room', roomId);
}

function toggleFS(id) { document.getElementById(id).requestFullscreen(); }

function endCall() {
    // Detiene todo el hardware y recarga
    if(localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(t => t.stop());
    }
    window.location.reload();
}

document.getElementById('volRemote').addEventListener('input', (e) => {
    remoteVideo.volume = e.target.value;
});

startCamera();
