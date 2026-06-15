const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const timerDisplay = document.getElementById('timer');
let localStream, timerInterval, seconds = 0, minutes = 0, hours = 0;

// Generar ID al cargar
window.onload = () => {
    document.getElementById('roomInput').value = Math.random().toString(36).substring(2, 9);
};

// Audio Profesional (Anti-Eco / Anti-Grillo)
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
        localVideo.muted = true; // Mute local obligatorio
        startTimer();
    } catch (err) { console.error("Error de cámara:", err); }
}

// Contador
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

// Monitor de Salud (Independiente)
function monitorStats(pc, elementId) {
    setInterval(async () => {
        if (pc && pc.getStats) {
            const stats = await pc.getStats();
            let healthy = true;
            stats.forEach(report => {
                if (report.type === 'inbound-rtp' && report.packetsLost > 5) healthy = false;
            });
            document.getElementById(elementId).style.color = healthy ? "#00ff00" : "#ff3b30";
        }
    }, 3000);
}

function joinRoom() {
    const roomId = document.getElementById('roomInput').value;
    if (roomId) socket.emit('join-room', roomId);
}

function endCall() {
    clearInterval(timerInterval);
    if(localStream) localStream.getTracks().forEach(t => t.stop());
    window.location.reload();
}

startCamera();
