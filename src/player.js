class Song {
    constructor(AUDIO, COVER, TITLE, ARTIST, LYRICS) {
        this.AUDIO = AUDIO;
        this.COVER = COVER;
        this.TITLE = TITLE;
        this.ARTIST = ARTIST;
        this.LYRICS = LYRICS;
    }
}

let queue = [
    new Song("music/DearMyAll.mp3", "covers/DearMyAll.jpeg", "Dear My All", "Mingginyu", "DearMyAll.txt"),
    new Song("music/HushOfSunset.mp3", "covers/HushOfSunset.jpeg", "Hush of Sunset", "10cm", "HushofSunset.txt"),
    new Song("music/OnlyThen.mp3", "covers/OnlyThen.jpeg", "Only Then", "Roy Kim", "OnlyThen.txt"), 
    new Song("music/Daydream(feat. LeeHi).mp3", "covers/Daydream(feat. LeeHi).jpeg", "Daydream(feat. LeeHi)", "B.I, LeeHi", "Daydream(feat. LeeHi).txt"),
    new Song("music/TheNightsWindow.mp3", "covers/TheNight'sWindow.jpg", "The Night's Window", "Shin Ji Hoon", "TheNightsWindow.txt"),
    new Song("music/MiddleoftheNight.mp3", "covers/MiddleoftheNight.jpeg", "Middle of the Night", "MONSTA X", "MiddleoftheNight.txt")
];

let newTime;

let cover = document.querySelector('.album-cover img');
let title = document.querySelector('.title');
let artist = document.querySelector('.artist');

const playButton = document.querySelector('.play');
const icon = playButton.querySelector('.icon');

const nextButton = document.querySelector('.next');
const backButton = document.querySelector('.back');

const progressBar = document.querySelector('.progress-bar');
const currentBar = document.querySelector('.current');
const timeCurLabel = document.querySelector('.current-time');
const timeTotalLabel = document.querySelector('.total-time');

let isDragging = false;

const volumeBar = document.querySelector('.volume-bar');
const currentVolume = document.querySelector('.current-volume');

const shuffleButton = document.getElementById('shuffleImg');
let onShuffle = false;
const repeatButton = document.getElementById('repeatImg');
let onRepeat = false;
const lyricsButton = document.getElementById('lyricsImg');
let showLyrics = false;
const queueButton = document.getElementById('queueImg');
let showQueue = false;

const queueScreen = document.querySelector('.queue-screen');
const nowCover = document.querySelector('.now-playing-cover img');
const nowTitle = document.querySelector('.now-playing-title');
const nowArtist = document.querySelector('.now-playing-artist');
const nextSongs = document.querySelector('.playlist');

const lyricsScreen = document.querySelector('.lyrics-screen');
const lyricsContent = document.querySelector('.lyrics-content');

let idx = 0;
let player = new Audio(queue[idx].AUDIO);
cover.src = queue[idx].COVER;
title.textContent = `${queue[idx].TITLE}`;
artist.textContent = `${queue[idx].ARTIST}`;
loadLyrics(0);

player.volume = 0.5;

function escapeHtml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function loadLyrics(i) {
  const filename = queue[i].LYRICS;

  if (!filename) {
    lyricsContent.textContent = 'No Lyrics Available';
    lyricsScreen.style.display = 'block';
    return;
  }

  lyricsContent.textContent = 'Loading…';
  lyricsScreen.style.display = 'block';

  try {
    const res = await window.lyricsAPI.read(filename);

    if (!res || !res.ok) {
      lyricsContent.textContent = 'Lyrics not available';
      console.error('lyrics error:', res && res.error);
      return;
    }

    const text = res.text.replace(/\r\n/g, '\n');

    const lines = text.split('\n');

    // turn empty lines into a visible gap
    const html = lines.map(line => {
        const isKorean = /[\uAC00-\uD7A3]/.test(line);
        const safeLine = escapeHtml(line);
        return `<p class="lyric-line ${isKorean ? 'korean' : 'english'}">${safeLine}</p>`;
    }).join('');

    lyricsContent.innerHTML = html;
    lyricsScreen.style.display = 'block';
  } catch (err) {
    lyricsContent.textContent = 'Failed to load lyrics';
    console.error(err);
  }
}

function loadSong(i) {
    player.src = queue[i].AUDIO;
    cover.src = queue[i].COVER;
    title.textContent = `${queue[i].TITLE}`;
    artist.textContent = `${queue[i].ARTIST}`;
}

function shufflePlaylist() {
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
}

function updateQueueScreen() {
    nowCover.src = queue[idx].COVER;
    nowTitle.textContent = `${queue[idx].TITLE}`;
    nowArtist.textContent = `${queue[idx].ARTIST}`;

    nextSongs.innerHTML = '';

    let QUEUE_LEN;
    onRepeat ? QUEUE_LEN = queue.length : QUEUE_LEN = (queue.length - idx);

    for (let i = 1; i < QUEUE_LEN; i++) {
        const nextIdx = (idx + i) % queue.length;
        const song = queue[nextIdx];

        const songDiv = document.createElement('div');
        songDiv.classList.add('song-profile');
        songDiv.innerHTML = `
            <div class="next-cover">
                <img src="${song.COVER}">
            </div>
            <div class="next-profile">
                <div class="next-title">${song.TITLE}</div>
                <div class="next-artist">${song.ARTIST}</div>
            </div>
        `;

        songDiv.addEventListener('click', (e) => {
            idx = nextIdx;
            player.pause();
            loadSong(idx);
            loadLyrics(idx);
            player.play();
            icon.src = "assets/Resume Button.png";

            updateQueueScreen();
        });

        nextSongs.appendChild(songDiv);
    }
}

nextButton.addEventListener('click', (e) => {
    player.pause();

    idx = (idx + 1) % queue.length;

    loadSong(idx);
    loadLyrics(idx);

    icon.src = "assets/Resume Button.png";

    player.play();
});

backButton.addEventListener('click', (e) => {
    player.pause();

    idx == 0 ? idx = (queue.length -1) : idx--;

    loadSong(idx);
    loadLyrics(idx);

    icon.src = "assets/Resume Button.png";

    player.play();
});

playButton.addEventListener('click', (e) => {
    if(player.paused) {
        player.play();
        icon.src = "assets/Resume Button.png";
    }
    else {
        player.pause();
        icon.src = "assets/Play Button.png";
    }
});

player.addEventListener("timeupdate", (e) => {
    if (isDragging) return;

    timeTotalLabel.textContent = formatTime(player.currentTime);

    const progress_percent = (player.currentTime / player.duration) * 100;
    currentBar.style.width = `${progress_percent}%`;

    if(player.currentTime == player.duration) {
        if(onShuffle) {
            shufflePlaylist();
        }

        if(!onRepeat && idx == (queue.length-1)) {
            player.pause();
            icon.src = "assets/Play Button.png";
        }
        else {
            idx = (idx + 1) % queue.length;

            loadSong(idx);
            loadLyrics(idx);

            icon.src = "assets/Resume Button.png";

            player.play();
        }
    }
});

player.addEventListener('loadedmetadata', (e) => {
    timeCurLabel.textContent = formatTime(player.duration);
});

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const barWidth = rect.width;
    const newTime = (clickX / barWidth) * player.duration;

    player.currentTime = newTime;

    currentBar.style.width = `${(clickX / barWidth) * 100}%`;
});

progressBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateDrag(e);
});

document.addEventListener('mousemove', (e) => {
    if(isDragging) {
        updateDrag(e);
    }
});

document.addEventListener('mouseup', (e) => {
    if(isDragging) {
        isDragging = false;
        updateDrag(e);
        player.currentTime = newTime;
    } 
});

function updateDrag(e) {
    const rect = progressBar.getBoundingClientRect();
    let dragOffset = e.clientX - rect.left;

    dragOffset = Math.max(0, Math.min(dragOffset, rect.width));

    newTime = (dragOffset / rect.width) * player.duration;

    const progress_percent = (dragOffset / rect.width) * 100;
    currentBar.style.width = `${(progress_percent)}%`;
}

volumeBar.addEventListener('click', (e) => {
    console.log(`Volum Bar click registered`);

    const rect = volumeBar.getBoundingClientRect();
    let volX = e.clientX - rect.left;
    let volWidth = rect.width;

    if (volWidth <= 0) return;

    let volume_scale = Math.max(0, Math.min(1, volX / volWidth));
    player.volume = volume_scale;
    currentVolume.style.width = `${(volume_scale * 100)}%`;
});

repeatButton.addEventListener('click', (e) => {
    if(onRepeat) {
        repeatButton.src = "assets/Repeat.png";
    } 
    else {
        repeatButton.src = "assets/RepeatTinted.png";
    }

    onRepeat = !onRepeat;
    updateQueueScreen();
});

shuffleButton.addEventListener('click', (e) => {
    if(onShuffle) {
        shuffleButton.src = "assets/Shuffle.png";
    } 
    else {
        shuffleButton.src = "assets/ShuffleTinted.png";
    }

    onShuffle = !onShuffle;
});

lyricsButton.addEventListener('click', (e) => {
    if(showLyrics) {
        lyricsButton.src = "assets/Lyrics.png";

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } 
    else {
        lyricsButton.src = "assets/LyricsTinted.png";

        lyricsContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showLyrics = !showLyrics;
});

queueButton.addEventListener('click', (e) => {
    if(showQueue) {
        queueButton.src = "assets/Queue.png";
    } 
    else {
        queueButton.src = "assets/QueueTinted.png";
    }

    showQueue = !showQueue;

    queueScreen.classList.toggle('hidden');
    updateQueueScreen();
});