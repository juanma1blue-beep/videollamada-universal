const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const timerDisplay = document.getElementById('timer');
let localStream, timerInterval, seconds = 0, minutes = 0, hours = 0;

// 1. Generación inmediata del código de sala
window.onload = () => {
    const randomRoom = Math.random().toString(36).substring(2, 9);
    document.getElementById('roomInput').value = randomRoom;
};

// 2. Audio Profesional (Hardcore Anti-Eco)
async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: {
                echoCancellation: { exact: true },
                noiseSuppression: { exact: true },
                autoGainControl: { exact: true },
                latency: 0
            } 
        });
        localVideo.srcObject = localStream;
        localVideo.muted = true; // Mute local obligatorio para evitar tu propia voz
        startTimer();
    } catch (err) { console.error("Error de cámara:", err); }
}

// 3. Cronómetro (HH:MM:SS)
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        if (seconds === 60) { seconds = 0; minutes++; }
        if (minutes === 60) { minutes = 0; hours++; }
        timerDisplay.innerText = 
            (hours < 10 ? "0"+hours : hours) + ":" + 
            (minutes < 10 ? "0"+minutes : minutes) + ":" + 
            (seconds < 10 ? "0"+seconds : seconds);
    }, 1000);
}

function joinRoom() {
    const roomId = document.getElementById('roomInput').value;
    if (roomId) socket.emit('join-room', roomId);
}

function endCall() {
    clearInterval(timerInterval);
    if(localStream) localStream.getTracks().forEach(t => t.stop());
    window.location.reload(); // Limpieza profunda al colgar
}

startCamera();
