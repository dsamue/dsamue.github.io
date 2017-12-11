var localVideo;
var remoteVideo;
var peerConnection;
var uuid;

var peerConnectionConfig = {
  'iceServers': [
    {'urls': 'stun:stun.services.mozilla.com'},
    {'urls': 'stun:stun.l.google.com:19302'},
  ]
};

function pageReady() {
  uuid = uuid();

  localVideo = document.getElementById('localVideo');
  remoteVideo = document.getElementById('remoteVideo');

  serverConnection = new WebSocket('wss://' + window.location.hostname + ':8443');
  serverConnection.onmessage = gotMessageFromServer;

  var constraints = {
    video: true,
    audio: true,
  };

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(getUserMediaSuccess)
      .catch(errorHandler);
  } else {
    alert('Your browser does not support getUserMedia API');
  }
}

function getUserMediaSuccess(stream) {
  localStream = stream;
  localVideo.src = window.URL.createObjectURL(stream);
}

function start(isCaller) {
  peerConnection = new RTCPeerConnection(peerConnectionConfig);
  peerConnection.onicecandidate = gotIceCandidate;
  peerConnection.onaddstream = gotRemoteStream;
  peerConnection.addStream(localStream);

  if (isCaller) {
    peerConnection.createOffer()
      .then(createdDescription)
      .catch(errorHandler);
  }
}

function gotMessageFromServer(message) {
  if (!peerConnection) start(false);

  var signal = JSON.parse(message.data);

  // Ignore messages from ourself
  if (signal.uuid == uuid) return;

  if (signal.sdp) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp))
      .then(function() {
        // Only create answers in response to offers
        if (signal.sdp.type == 'offer') {
          peerConnection.createAnswer()
            .then(createdDescription)
            .catch(errorHandler);
        }
      })
      .catch(errorHandler);
  } else if (signal.ice) {
    peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice))
      .catch(errorHandler);
  }
}

function gotIceCandidate(event) {
  if (event.candidate != null) {
    serverConnection.send(JSON.stringify({
      'ice': event.candidate,
      'uuid': uuid
    }));
  }
}

function createdDescription(description) {
  console.log('got description');

  peerConnection.setLocalDescription(description)
    .then(function() {
      serverConnection.send(JSON.stringify({
        'sdp': peerConnection.localDescription,
        'uuid': uuid
      }));
    })
    .catch(errorHandler);
}

function gotRemoteStream(event) {
  console.log('got remote stream');
  remoteVideo.src = window.URL.createObjectURL(event.stream);

  applyChromaKeyFilters();
}

function applyChromaKeyFilters() {
  //main code goes here

  // declare our variables
  var seriously, // the main object that holds the entire composition
    gUM, // will reference getUserMedia or whatever browser-prefixed version we can find
    URL, // will reference window.URL or whatever browser-prefixed version we can find
    image, // atomics jpg image
    source, // wrapper object for source video
    chroma, // chroma detection effect
    blend,
    target; // a wrapper object for our target canvas

  // construct our seriously object
  seriously = new Seriously();


  source1 = seriously.source(localVideo);
  source2 = seriously.source(remoteVideo);

  target = seriously.target('#target');
  chroma = seriously.effect('chroma');
  blend = seriously.effect('blend');

  chroma.color = [0.76, 0.25, 0.12, 1];
  chroma.weight = 1;
  chroma.balance = 0.9;
  chroma.clipBlack = 0.25;
  chroma.clipWhite = 1;

  // connect all our nodes in the right order
  chroma.source = source1;
  blend.top = chroma;
  blend.bottom = source2;
  target.source = blend;

  seriously.go();
}

function errorHandler(error) {
  console.log(error);
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function uuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
