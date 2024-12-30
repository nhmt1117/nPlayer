let playLyrics = document.getElementById('player_lyrics');
// let playListBd = document.querySelector('.play_list_bd');



function parseLyrics(lyrics) {
    const lines = lyrics.split('\n');
    return lines
        .filter(line => line.match(/\[\d{2}:\d{2}\.\d{2}\]/))
        .map(line => {
            const match = line.match(/\[(\d{2}:\d{2}\.\d{2})\](.*)/);
            const timeParts = match[1].split(':');
            const seconds = parseInt(timeParts[0]) * 60 + parseFloat(timeParts[1]);
            return {
                time: seconds * 1000,
                text: match[2].trim(),
            };
        });
}

function displayLyrics(lyrics) {
    const container = document.getElementById('player_music_lyrics');
    container.innerHTML = '';
    lyrics.forEach(line => {
        const div = document.createElement('div');
        div.textContent = line.text;
        div.classList.add('lyric-line');
        div.setAttribute('data-time', line.time);
        container.appendChild(div);
    });
}
let previousIndex = 0;
let isUpdateIndex = false;
let isActive = false;
function updateLyrics(time) {
    const lyrics = document.querySelectorAll('.lyric-line');
    let activeLyricIndex = 0;

    const currentTimeMs = time * 1000+600;


    
    // 找到当前时间的歌词索引
    for (let i = 0; i < lyrics.length; i++) {
        const lineTime = lyrics[i].getAttribute('data-time');
        if (currentTimeMs <= lineTime) {
            activeLyricIndex = i - 1;
            if (previousIndex != activeLyricIndex) {
                previousIndex = activeLyricIndex;
                isUpdateIndex = true;
            }
            
            console.log(isUpdateIndex);
            break;
        }
    }
    
    // 高亮当前歌词并滚动到中间
    lyrics.forEach((lyric, index) => {
        if (index === activeLyricIndex && isUpdateIndex) {
            lyric.classList.add('active');
            lyric.scrollIntoView({ behavior: "smooth", block: "center" });
            isUpdateIndex = false;
            isActive = true;
        }
    });
    if (isActive = true) {
        lyrics.forEach((lyric, index) => {
            lyric.classList.remove('active');
        });
        isActive = false;
    }
    
}

function getLyricsUrl(songIndex) {
    const songPath = songList[songIndex];
    return songPath.replace(/\.[^/.]+$/, '.lrc');
    
}
function loadLyrics(songIndex) {
    const lyricsUrl = songList[songIndex].replace(/\.[^/.]+$/, '.lrc');
    
    fetch(lyricsUrl)
    .then(response => response.text())
    .then(lyricsText => {
        const parsedLyrics = parseLyrics(lyricsText);
        displayLyrics(parsedLyrics);
    })
    .catch(error => console.error('Error loading lyrics:', error));
}