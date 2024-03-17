// AI Websocket
// const web_socket = new WebSocket('ws://127.0.0.1:5555/echo');

// web_socket.addEventListener('open', function (event) {
//   console.log('WebSocket connected');
// });

// web_socket.addEventListener('message', function (event) {
//   console.log('Message from server:', JSON.parse(event.data));
//   var socketMessage = JSON.parse(event.data)
//   if(socketMessage["status"] == "end") {
//     document.querySelector(".transcriptionsBox").textContent = "";
//   }
//   else {
//     document.querySelector(".transcriptionsBox").textContent += socketMessage["message"];
//   }
// });
// Fetch audio from /say-prompt endpoint and set it as the source for the audio element
async function fetchAudio(prompt) {
  try {
    const response = await fetch(`/meeting/say-prompt?prompt=${encodeURIComponent(prompt)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
    }
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    document.getElementById('audioPlayer').src = audioUrl;
    document.getElementById('audioPlayer').play()
  } catch (error) {
    console.error('Error fetching audio:', error);
  }
}

// Function to fetch prompt from input field and play audio
function fetchAndPlayAudio() {
  const prompt = document.querySelector('.transcriptionsBox').textContent;
  if (prompt.trim() !== '') {
    fetchAudio(prompt);
  } else {
    console.error('Prompt cannot be empty');
  }
}

async function getMicrophone() {
    const userMedia = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
  
    return new MediaRecorder(userMedia);
  }

async function openMicrophone(microphone, socket) {
    await microphone.start(500);
  
    microphone.onstart = () => {
      console.log("client: microphone opened");
      document.body.classList.add("recording");
    };
  
    microphone.onstop = () => {
      console.log("client: microphone closed");
      document.body.classList.remove("recording");
    };
  
    microphone.ondataavailable = (e) => {
      const data = e.data;
      console.log("client: sent data to websocket");
      socket.send(data);
    };
  }
  
  async function closeMicrophone(microphone) {
    microphone.stop();
  }

async function start(socket) {
  let microphone;

  console.log("client: waiting to open microphone");

  if (!microphone) {
    // open and close the microphone
    microphone = await getMicrophone();
    await openMicrophone(microphone, socket);
  } else {
    await closeMicrophone(microphone);
    microphone = undefined;
  }
}


async function getTempApiKey() {
    const result = await fetch("/meeting/key");
    const json = await result.json();
  
    return json.key;
  }

window.addEventListener("load", async () => {
  const key = await getTempApiKey();

  const { createClient } = deepgram;
  const _deepgram = createClient(key);

  const socket = _deepgram.listen.live({ model: "nova", smart_format: true });

  socket.on("open", async () => {
    console.log("client: connected to websocket");

    socket.on("Results", (data) => {
      console.log("Data: ", data);

      const transcript = data.channel.alternatives[0].transcript;

      document.querySelector(".transcriptionsBox").textContent = ""

      if (transcript !== "") {
        document.querySelector(".transcriptionsBox").textContent = transcript
        fetchAndPlayAudio()
        console.log(transcript);
        // web_socket.send(transcript)
      }
    });

    socket.on("error", (e) => console.error(e));

    socket.on("warning", (e) => console.warn(e));

    socket.on("Metadata", (e) => console.log(e));

    socket.on("close", (e) => console.log(e));

    await start(socket);
  });
});
