const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const timerDisplay = document.getElementById('timer');
let localStream, timerInterval, seconds = 0, minutes = 0, hours = 0;

// Inicialización instantánea
window.onload = () => {
    document.getElementById('roomInput').value = Math.random().toString(36).substring(2, 9);
};

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
    } catch (err) { console.error("Error cámara:", err); }
}

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

function monitorStats(pc, elementId) {
    setInterval(async () => {
        if (pc && pc.getStats) {
            const stats = await pc.getStats();
            let rtt = 0, packetsLost = 0;
            stats.forEach(report => {
                if (report.type === 'candidate-pair' && report.currentRoundTripTime) rtt = report.currentRoundTripTime * 1000;
                if (report.type === 'inbound-rtp' && report.packetsLost) packetsLost = report.packetsLost;
            });
            const el = document.getElementById(elementId);
            if (packetsLost > 10 || rtt > 300) el.style.color = "#ff3b30";
            else if (packetsLost > 2 || rtt > 150) el.style.color = "#ff9500";
            else el.style.color = "#00ff00";
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
