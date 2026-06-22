// Generate a random room code when the page loads
const roomCode = Math.floor(Math.random() * 1000000);
document.getElementById('room-code-input').value = `Room Code: ${roomCode}`;

// Get the local video and remote video elements
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');

// Start button click event handler
document.getElementById('start-call-btn').addEventListener('click', () => {
  // Get the room code from the input field
  const roomCodeInput = document.getElementById('room-code-input').value;
  if (roomCodeInput === `Room Code: ${roomCode}`) {
    // Start the video call
    startCall();
  } else {
    alert('Invalid room code. Please enter the correct room code.');
  }
});

// Function to start the video call
async function startCall() {
  try {
    // Request access to the user's camera and microphone
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    // Add the stream to the local video element
    localVideo.srcObject = stream;
    localVideo.play();
    
    // Create a peer connection object
    const pc = new RTCPeerConnection();
    
    // Set up the peer connection's onaddstream event handler
    pc.onaddstream = (event) => {
      // Add the received stream to the remote video element
      remoteVideo.srcObject = event.stream;
      remoteVideo.play();
    };
    
    // Create an offer and set it as the local description
    const offer = await pc.createOffer();
    pc.setLocalDescription(new RTCSessionDescription({ type: 'offer', sdp: offer }));
    
    // Send the offer to the peer (server)
    fetch('/start-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, offer }),
    });
  } catch (error) {
    console.error('Error starting video call:', error);
  }
}

// Function to handle the peer connection's onicecandidate event
function handleIceCandidate(event) {
  if (event.candidate) {
    // Send the ice candidate to the peer (server)
    fetch('/add-ice-candidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, event.candidate }),
    });
  }
}
