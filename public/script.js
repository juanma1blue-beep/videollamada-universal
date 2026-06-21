 /* =========================
   INIT PEER
========================= */

function initPeer(){

    if(APP.peer) return;

    APP.peer = new Peer();

    APP.peer.on("open", id => {
        console.log("Peer ID:", id);
        setStatus("🟢 Conectado al servidor");
    });

    APP.peer.on("call", async (incomingCall) => {

        await initMedia();

        APP.call = incomingCall;

        APP.call.answer(APP.stream);

        APP.call.on("stream", (remoteStream) => {
            document.getElementById("remoteVideo").srcObject = remoteStream;
            setStatus("🟢 En llamada");
        });

        APP.call.on("close", () => {
            hangUp();
        });

    });

    APP.peer.on("error", (err) => {
        console.error(err);
        setStatus("🔴 Error PeerJS");
    });
}
async function startCall(){

    await initMedia();
    initPeer();

    const targetId = document.getElementById("roomCode").value;

    if(!targetId){
        setStatus("🔴 Falta código");
        return;
    }

    if(APP.call){
        APP.call.close();
    }

    APP.call = APP.peer.call(targetId, APP.stream);

    APP.call.on("stream", (remoteStream) => {
        document.getElementById("remoteVideo").srcObject = remoteStream;
        setStatus("🟢 En llamada");
    });

    APP.call.on("close", () => {
        hangUp();
    });

    setStatus("🟡 Llamando...");
}
function hangUp(){

    try {

        if(APP.call){
            APP.call.close();
            APP.call = null;
        }

        if(APP.stream){
            APP.stream.getTracks().forEach(t => t.stop());
        }

        document.getElementById("remoteVideo").srcObject = null;
        document.getElementById("localVideo").srcObject = null;

        setStatus("🔴 Llamada finalizada");

    } catch(e){
        console.error(e);
    }
}
async function initAI(){

    try {

        setStatus("🟡 Cargando IA...");

        APP.model = await handpose.load();

        setStatus("🟢 IA lista");

        startDetectionLoop();

    } catch(e){
        console.error(e);
        setStatus("🔴 Error IA");
    }
}
function isStopGesture(hand){

    if(!hand || !hand.landmarks) return false;

    const lm = hand.landmarks;

    const index = lm[8];
    const middle = lm[12];
    const ring = lm[16];
    const pinky = lm[20];
    const wrist = lm[0];

    // dedos por encima de la muñeca (mano abierta)
    const fingersUp =
        index[1] < wrist[1] &&
        middle[1] < wrist[1] &&
        ring[1] < wrist[1] &&
        pinky[1] < wrist[1];

    return fingersUp;
}
function startDetectionLoop(){

    if(APP.detecting) return;

    APP.detecting = true;

    const loop = async () => {

        if(!APP.model || !APP.stream){
            requestAnimationFrame(loop);
            return;
        }

        const video = document.getElementById("localVideo");

        try {

            const hands = await APP.model.estimateHands(video);

            if(hands.length > 0 && isStopGesture(hands[0])){

                APP.stopFrames++;

                setStatus("🟡 STOP detectado (" + APP.stopFrames + ")");

                if(APP.stopFrames >= 6){

                    APP.stopFrames = 0;

                    setStatus("🔴 Colgando por gesto STOP");

                    hangUp();
                }

            } else {
                APP.stopFrames = 0;
            }

        } catch(e){
            console.error(e);
        }

        requestAnimationFrame(loop);
    };

    loop();
}
async function startAIIfNeeded(){
    if(!APP.model){
        await initAI();
    }
}
await startAIIfNeeded();
document.getElementById("gestureStatus").innerText =
    (APP.stopFrames > 0)
        ? "🟡 STOP detectado"
        : "🤚 Gesto normal";
function cleanupAll(){

    try {

        // CALL
        if(APP.call){
            APP.call.close();
            APP.call = null;
        }

        // PEER
        if(APP.peer && !APP.peer.destroyed){
            APP.peer.destroy();
            APP.peer = null;
        }

        // STREAM
        if(APP.stream){
            APP.stream.getTracks().forEach(track => track.stop());
            APP.stream = null;
        }

        // VIDEO RESET
        document.getElementById("remoteVideo").srcObject = null;
        document.getElementById("localVideo").srcObject = null;

        // RESET IA
        APP.model = null;
        APP.detecting = false;
        APP.stopFrames = 0;

        setStatus("🔴 Sistema limpio");

    } catch(e){
        console.error(e);
    }
}
function hangUp(){

    cleanupAll();

    // opcional: reinicializar peer después de colgar
    setTimeout(() => {
        initPeer();
    }, 1000);
}
function enableAutoReconnect(){

    if(!APP.peer) return;

    APP.peer.on("disconnected", () => {
        setStatus("🟡 Reconectando...");

        try {
            APP.peer.reconnect();
        } catch(e){
            console.error(e);
        }
    });

    APP.peer.on("close", () => {
        setStatus("🔴 Conexión cerrada");
    });

    APP.peer.on("error", (err) => {
        console.error(err);
        setStatus("🔴 Error conexión Peer");
    });
}
function safeStartCall(){

    if(APP.call){
        setStatus("🟡 Ya hay una llamada activa");
        return;
    }

    startCall();
}
let callTimer = null;
let seconds = 0;

function startTimer(){

    seconds = 0;

    callTimer = setInterval(() => {

        seconds++;

        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;

        setStatus(`🟢 En llamada ${min}:${sec.toString().padStart(2,"0")}`);

    }, 1000);
}

function stopTimer(){
    clearInterval(callTimer);
}
startTimer();
stopTimer();
function resetState(){

    APP.call = null;
    APP.detecting = false;
    APP.stopFrames = 0;

}
resetState();
const AI_CONFIG = {
    maxHands: 1,
    flipHorizontal: true,
    scoreThreshold: 0.7
};
const hands = await APP.model.estimateHands(video, AI_CONFIG);
const APP = {
    peer: null,
    call: null,
    stream: null,
    model: null,
    room: "",
    detecting: false,
    stopFrames: 0,
    callStartTime: null
};

const socket = io();

/* =========================
   STATUS SYSTEM
========================= */

function setStatus(text){
    document.getElementById("status").innerText = text;
}

/* =========================
   ROOM GENERATOR
========================= */

function generateCode(){
    const code = "BASE44-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById("roomCode").value = code;
    navigator.clipboard.writeText(code);
}

/* =========================
   AUDIO + VIDEO PRO (V4)
========================= */

async function initMedia(){

    if(APP.stream) return APP.stream;

    try {

        APP.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                channelCount: 1
            },
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
            }
        });

        document.getElementById("localVideo").srcObject = APP.stream;

        setStatus("🟢 Audio PRO activo");

        return APP.stream;

    } catch(e){
        console.error(e);
        setStatus("🔴 Error cámara/mic");
    }
}

/* =========================
   PEER INIT (SAFE SINGLETON)
========================= */

function initPeer(){

    if(APP.peer) return;

    APP.peer = new Peer();

    APP.peer.on("open", id => {
        setStatus("🟢 Conectado Peer: " + id);
    });

    APP.peer.on("call", async (incomingCall) => {

        await initMedia();

        APP.call = incomingCall;
        APP.call.answer(APP.stream);

        APP.call.on("stream", (remoteStream) => {

            document.getElementById("remoteVideo").srcObject = remoteStream;

            setStatus("🟢 En llamada");

            APP.callStartTime = Date.now();

        });

        APP.call.on("close", () => {
            hangUp();
        });

    });

    APP.peer.on("error", (err) => {
        console.error(err);
        setStatus("🔴 Error Peer");
    });
}

/* =========================
   START CALL
========================= */

async function startCall(){

    await initMedia();
    initPeer();

    const target = document.getElementById("roomCode").value;

    if(!target){
        setStatus("🔴 Código vacío");
        return;
    }

    if(APP.call){
        APP.call.close();
    }

    APP.call = APP.peer.call(target, APP.stream);

    APP.call.on("stream", (remoteStream) => {

        document.getElementById("remoteVideo").srcObject = remoteStream;

        setStatus("🟢 En llamada");

        APP.callStartTime = Date.now();

    });

    APP.call.on("close", hangUp);

    setStatus("🟡 Llamando...");
}

/* =========================
   CLEANUP TOTAL (CRÍTICO)
========================= */

function cleanupAll(){

    if(APP.call){
        APP.call.close();
        APP.call = null;
    }

    if(APP.peer && !APP.peer.destroyed){
        APP.peer.destroy();
        APP.peer = null;
    }

    if(APP.stream){
        APP.stream.getTracks().forEach(t => t.stop());
        APP.stream = null;
    }

    document.getElementById("remoteVideo").srcObject = null;
    document.getElementById("localVideo").srcObject = null;

    APP.stopFrames = 0;
    APP.detecting = false;
    APP.model = null;

    setStatus("🔴 Sistema limpio");
}

/* =========================
   HANG UP
========================= */

function hangUp(){
    cleanupAll();
    initPeer(); // reconexión limpia
}

/* =========================
   CHAT SAFE
========================= */

function sendChat(){

    const input = document.getElementById("chatInput");
    const msg = input.value.trim();

    if(!msg) return;

    const div = document.createElement("div");
    div.textContent = "Tú: " + msg;

    document.getElementById("chatBox").appendChild(div);

    input.value = "";
}

/* =========================
   AI LOAD
========================= */

async function initAI(){

    setStatus("🟡 Cargando IA...");

    APP.model = await handpose.load();

    setStatus("🟢 IA lista");

    startDetectionLoop();
}

/* =========================
   STOP GESTURE
========================= */

function isStopGesture(hand){

    const lm = hand.landmarks;

    const wrist = lm[0];

    const fingers =
        lm[8][1] < wrist[1] &&
        lm[12][1] < wrist[1] &&
        lm[16][1] < wrist[1] &&
        lm[20][1] < wrist[1];

    return fingers;
}

/* =========================
   DETECTION LOOP (STABLE)
========================= */

function startDetectionLoop(){

    if(APP.detecting) return;

    APP.detecting = true;

    const loop = async () => {

        if(APP.model && APP.stream){

            const video = document.getElementById("localVideo");

            try {

                const hands = await APP.model.estimateHands(video);

                if(hands.length > 0 && isStopGesture(hands[0])){

                    APP.stopFrames++;

                    if(APP.stopFrames >= 6){

                        APP.stopFrames = 0;
                        hangUp();
                    }

                } else {
                    APP.stopFrames = 0;
                }

            } catch(e){
                console.error(e);
            }
        }

        requestAnimationFrame(loop);
    };

    loop();
}

/* =========================
   SAFE CALL WRAPPER
========================= */

async function safeStartCall(){

    if(APP.call){
        setStatus("🟡 Llamada activa");
        return;
    }

    await startCall();
    await initAI();
}
