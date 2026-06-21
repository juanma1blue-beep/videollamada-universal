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
