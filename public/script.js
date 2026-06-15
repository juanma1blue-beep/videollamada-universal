const localVideo = document.getElementById('localVideo');
const timerDisplay = document.getElementById('timer');
let seconds = 0, minutes = 0, hours = 0;
let timerInterval;

// 1. Iniciar contador (00:00:00)
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        if (seconds === 60) { seconds = 0; minutes++; }
        if (minutes === 60) { minutes = 0; hours++; }
        timerDisplay.innerText = 
            (hours < 10 ? "0" + hours : hours) + ":" + 
            (minutes < 10 ? "0" + minutes : minutes) + ":" + 
            (seconds < 10 ? "0" + seconds : seconds);
    }, 1000);
}

// 2. Audio Profesional (Anti-Eco / Anti-Grillo)
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: {
                echoCancellation: { exact: true },
                noiseSuppression: { exact: true },
                autoGainControl: { exact: true },
                sampleRate: 48000,
                channelCount: 1
            }
        });
        localVideo.srcObject = stream;
        localVideo.muted = true; // Fundamental: Silenciar salida local
        startTimer(); // Iniciar contador al conectar
    } catch (err) { alert("Error de audio: " + err.message); }
}

function endCall() {
    clearInterval(timerInterval);
    if(localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(track => track.stop());
    }
    window.location.reload();
}

startCamera();
