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
let isMicOn = true;
let audioChunks = [];

async function fetchAudio(prompt) {
  try {
    const response = await fetch(
      `/meeting/say-prompt?prompt=${encodeURIComponent(prompt)}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch audio: ${response.status} ${response.statusText}`
      );
    }
    // Fetching the audio data as an ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // Creating a new Blob with the desired MIME type
    const audioBlob = new Blob([arrayBuffer], { type: 'audio/webm;codecs=opus' });
    const audioUrl = URL.createObjectURL(audioBlob);
    document.getElementById("audioPlayer").src = audioUrl;
    document.getElementById("audioPlayer").play();
    document.querySelector(".candidateWindow").classList.remove("talking");
    document.querySelector(".interviewerWindow").classList.add("talking");

    // Store the interviewer's audio in audioChunks
    audioChunks.push(audioBlob); // Ensure consistent handling with the candidate's audio
  } catch (error) {
    console.error("Error fetching audio:", error);
  }
}

// Function to fetch prompt from input field and play audio
function fetchAndPlayAudio() {
  const prompt = document.querySelector(".transcriptionsBox").textContent;
  if (prompt.trim() !== "") {
    fetchAudio(prompt);
  } else {
    console.error("Prompt cannot be empty");
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
    audioChunks.push(data)
    console.log(data);
    console.log("client: sent data to websocket");
    socket.send(data);
  };
}

async function closeMicrophone(microphone) {
  microphone.stop();
}

let microphone;

async function start(socket) {
  console.log("client: waiting to open microphone");

  console.log(microphone);
  console.log(!microphone);

  if (!microphone) {
    // open and close the microphone
    microphone = await getMicrophone();
    console.log("Calling openMicrophone function...");
    await openMicrophone(microphone, socket);
  } else {
    // await closeMicrophone(microphone);
    // microphone = undefined;
  }
}

document.querySelector(".mic-on-off").onclick = async function () {
  if (isMicOn) {
    console.log("Stopping Mic");
    microphone.stop();
    isMicOn = false;
    microphone = undefined;
  } else {
    console.log("Opening mic");
    isMicOn = true;
    await openDeepgramSocket();
    // microphone.start(500)
  }
};

async function getTempApiKey() {
  const result = await fetch("/meeting/key");
  const json = await result.json();

  return json.key;
}

async function openDeepgramSocket() {
  console.log("Opening deepgram socket...");
  const key = await getTempApiKey();

  const { createClient } = deepgram;
  const _deepgram = createClient(key);

  const socket = _deepgram.listen.live({ model: "nova", smart_format: true });

  socket.on("open", async () => {
    console.log("client: connected to websocket");

    socket.on("Results", (data) => {
      console.log("Data: ", data);

      const transcript = data.channel.alternatives[0].transcript;

      document.querySelector(".transcriptionsBox").textContent = "";

      if (transcript !== "") {
        document.querySelector(".transcriptionsBox").textContent = transcript;
        document
          .querySelector(".interviewerWindow")
          .classList.remove("talking");
        document.querySelector(".candidateWindow").classList.add("talking");
        fetchAndPlayAudio();
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
}

window.addEventListener("load", async () => {
  await openDeepgramSocket();

  // set applicant name, pfp and position
  // Get the URL parameters
  const urlParams = new URLSearchParams(window.location.search);

  // Get the value of jobId from the query string
  const applicantId = urlParams.get("applicantId");

  if (applicantId) {
    // Now you can fetch application data using the applicantId
    fetch(`/panel/getapplicantdata?applicationId=${applicantId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch applicant data");
        }
        return response.json();
      })
      .then((data) => {
        if (data["status"] == true) {
          document.querySelector(".applicantName").textContent =
            data["data"]["first_name"] + " " + data["data"]["last_name"];
          document.querySelector(".appliedFor").textContent =
            data["data"]["job_title"];
          document.querySelector(".headerJobTitle").textContent =
            data["data"]["job_title"] + " - " + "Interview";

          const currentDate = new Date();
          const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
          const formattedDate = currentDate.toLocaleDateString('en-US', options);

          document.querySelector(".headerDate").textContent = formattedDate
          if ("profileImagePath" in data["data"]) {
            document
              .querySelector(".applicantPFP")
              .setAttribute(
                "src",
                `/panel/uploads/${data["data"]["profileImagePath"]}`
              );
          } else {
            document
              .querySelector(".applicantPFP")
              .setAttribute("src", `./static/images/profile.jpg`);
          }
        }
      });
  } else {
    console.error("Applicant ID not found in the query string.");
  }
});

// End meeting popup controls
var meetingDuration = ""
const popup = document.querySelector(".id-ps-popup");
const cancelButton = document.querySelector(".cncl-popup");
const endMeetingPopupLaunch = document.querySelector(".endMeetingPopupLaunch");
const meetingSummaryPopup = document.querySelector(".meetingSummaryPopup")
const endMeetingPopupButton = document.querySelector(".endMeetingPopupButton")

endMeetingPopupLaunch.addEventListener("click", function () {
  popup.style.display = "block";
});

cancelButton.addEventListener("click", function () {
  popup.style.display = "none";
});

endMeetingPopupButton.addEventListener("click", async function() {
  popup.style.display = "none";
  meetingSummaryPopup.style.display = "block"
  meetingDuration = document.querySelector(".headerDuration").textContent
  // Turn off mic
  if (isMicOn) {
    console.log("Clicking...")
    document.querySelector(".mic-on-off").click()
  }
  startCountdown()

  console.log(audioChunks)

  // // Convert audioChunks into a Blob
  // let audioRecordingBlob = new Blob(audioChunks, { type: 'audio/wav' });

  // // Create a URL for the Blob
  // let audioRecordingUrl = URL.createObjectURL(audioRecordingBlob);

  // // Play the audio
  // let audioRecordingPlayer = document.getElementById('audioRecording');
  // audioRecordingPlayer.src = audioRecordingUrl;


  // const audioFormData = new FormData();
  // audioChunks.forEach((chunk, index) => {
  //   audioFormData.append(`audio${index}`, chunk);
  // });
  // const audioChunksData = {}
  // audioFormData.forEach((value, key) => {
  //   audioChunksData[key] = value;
  // });

  // const postChunksData = await axios
  // .post("/meeting/saveaudiorecording", audioChunksData)
  // .then((res) => {
  //   console.log(res)
  // })

//   try {
//     const formData = new FormData();
//     audioChunks.forEach((chunk, index) => {
//         formData.append(`audio${index}`, chunk);
//     });

//     const response = await fetch('/meeting/saveaudiorecording', {
//         method: 'POST',
//         body: formData
//     });

//     if (!response.ok) {
//         throw new Error('Failed to upload audio data');
//     }

//     console.log('Audio data uploaded successfully');
// } catch (error) {
//     console.error('Error uploading audio data:', error);
// }

  // set popup meeting duration
  var totalSeconds = durationToSeconds(meetingDuration);
  document.querySelector(".meetingDuration").textContent = `${totalSeconds} seconds`

  // Get form data
  const formData = new FormData();
  const urlParams = new URLSearchParams(window.location.search);
  formData.append("jobId", urlParams.get("jobId"))
  formData.append("applicantId", urlParams.get("applicantId"))
  formData.append("interviewDuration", totalSeconds)

  // Convert form data to JSON object
  const interviewData = {};
  formData.forEach((value, key) => {
    interviewData[key] = value;
  });

  const postData = await axios
    .post("/meeting/endmeeting", interviewData)
    .then((res) => {
      console.log(res)
    });
})

// Countdown function
function startCountdown() {
  var seconds = 10;
  var countdownElement = document.getElementById('countdown');
  var countdownInterval = setInterval(function() {
      seconds--;
      countdownElement.textContent = seconds;
      if (seconds <= 0) {
          clearInterval(countdownInterval);
          window.location.href = "/";
      }
  }, 1000);
}

function durationToSeconds(duration) {
  // Split the duration string into hours, minutes, and seconds
  var parts = duration.split(':');
  
  // Convert each part to an integer
  var hours = parseInt(parts[0], 10);
  var minutes = parseInt(parts[1], 10);
  var seconds = parseInt(parts[2], 10);
  
  // Calculate the total number of seconds
  var totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
  
  return totalSeconds;
}