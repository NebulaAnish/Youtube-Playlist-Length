const inputField = document.getElementById('url');
const submitButton = document.getElementById('submitButton');
const apiKey = 'AIzaSyAYQY7F1SlKNE1ynfN70KCRkFsCXVjkkyM';
const normal = document.getElementById('normal');
const one = document.getElementById('one');
const two = document.getElementById('two');
const three = document.getElementById('three');
const output = document.getElementById('output');
const error = document.getElementById('error');

const videoItems = [];
let totalDurationInSeconds = 0;

function parseDurationToSeconds(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  const hours = (parseInt(match[1]) || 0);
  const minutes = (parseInt(match[2]) || 0);
  const seconds = (parseInt(match[3]) || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

function updateDurations() {
  normal.innerText = formatSecondsToHMS(totalDurationInSeconds);
  one.innerText = formatSecondsToHMS(totalDurationInSeconds / 1.25);
  two.innerText = formatSecondsToHMS(totalDurationInSeconds / 1.5);
  three.innerText = formatSecondsToHMS(totalDurationInSeconds / 2);
}

submitButton.addEventListener('click', (e) => {
  output.style.display = 'block';
error.style.display = 'none';
  e.preventDefault();
  const playlistUrl = inputField.value;
  const playlistId = extractPlaylistId(playlistUrl);
  const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        output.style.display = 'none';
        error.style.display = 'block';
      }


      return response.json();
    })
    .then(data => {
      totalDurationInSeconds = 0;

      videoItems.length = 0;
      videoItems.push(...data.items);

      const videoIds = videoItems.map(item => item.snippet.resourceId.videoId);
      const videoDetailPromises = videoIds.map(fetchVideoDetails);

      return Promise.all(videoDetailPromises);
    })
    .then(() => {
      console.log('Total duration of all videos (in seconds):', totalDurationInSeconds);
      
      updateDurations();
    });
});

function formatSecondsToHMS(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours} hrs ${minutes} min`;
}

function extractPlaylistId(url) {
  const playlistUrlPattern = /^https?:\/\/(www\.)?youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/;
  const match = url.match(playlistUrlPattern);
  return match ? match[2] : null;
}

function fetchVideoDetails(videoId) {
  const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;

  return fetch(videoDetailsUrl)
    .then(response => {
      if (!response.ok) {
        error.style.display = 'block';
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.json();
    })
    .then(data => {
      const duration = data.items[0].contentDetails.duration;
      // Parse the ISO 8601 duration format and add the seconds to the total duration
      const durationInSeconds = parseDurationToSeconds(duration);
      totalDurationInSeconds += durationInSeconds;
    });
}
