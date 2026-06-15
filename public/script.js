const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const timerDisplay = document.getElementById('timer');
let localStream, timerInterval, seconds = 0, minutes = 0, hours = 0;

// Generar ID al cargar
window.onload = () => {
    document.getElementById('roomInput').value = Math.random().toString(36).substring(2, 9);
};

async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
        });
        localVideo.srcObject = localStream;
        localVideo.muted = true; // Mute obligatorio para ti mismo
        startTimer();
    } catch (err) { alert("Error: " + err.message); }
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

function joinRoom() {
    const roomId = document.getElementById('roomInput').value;
    socket.emit('join-room', roomId);
    console.log("Conectado a:", roomId);
}

function endCall() {
    clearInterval(timerInterval);
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    socket.disconnect();
    window.location.reload();
}

startCamera();
