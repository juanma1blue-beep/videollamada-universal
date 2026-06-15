const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const timerDisplay = document.getElementById('timer');
const statusMessage = document.getElementById('statusMessage');
let localStream, timerInterval, seconds = 0, minutes = 0, hours = 0;

window.onload = () => { document.getElementById('roomInput').value = Math.random().toString(36).substring(2, 9); };

async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, latency: 0 } });
        localVideo.srcObject = localStream;
        localVideo.muted = true;
        startTimer();
    } catch (err) { console.error("Error cámara:", err); }
}

function toggleAudio() {
    const track = localStream.getAudioTracks()[0];
    track.enabled = !track.enabled;
    document.getElementById('btnAudio').style.backgroundColor = track.enabled ? "#333" : "#ff3b30";
}

function toggleVideo() {
    const track = localStream.getVideoTracks()[0];
    track.enabled = !track.enabled;
    document.getElementById('btnVideo').style.backgroundColor = track.enabled ? "#333" : "#ff3b30";
}

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        if (seconds === 60) { seconds = 0; minutes++; }
        if (minutes === 60) { minutes = 0; hours++; }
        timerDisplay.innerText = (hours < 10 ? "0"+hours : hours) + ":" + (minutes < 10 ? "0"+minutes : minutes) + ":" + (seconds < 10 ? "0"+seconds : seconds);
    }, 1000);
}

socket.on('disconnect', () => {
    statusMessage.innerText = "Reconectando...";
    statusMessage.style.color = "#ff9500";
    setTimeout(() => { socket.connect(); socket.emit('join-room', document.getElementById('roomInput').value); }, 5000);
});

socket.on('connect', () => statusMessage.innerText = "Conectado");
socket.on('user-joined', () => { statusMessage.innerText = "Usuario conectado"; statusMessage.style.color = "#00ff00"; });

function joinRoom() { const roomId = document.getElementById('roomInput').value; if (roomId) socket.emit('join-room', roomId); }
function endCall() { clearInterval(timerInterval); if(localStream) localStream.getTracks().forEach(t => t.stop()); window.location.reload(); }

startCamera();
