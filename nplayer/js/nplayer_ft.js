const audioPlayer = document.getElementById('audio_player');
const voiceIcon = document.getElementById('voice_icon');
const playIcon = document.getElementById('play_icon');
const modeIcon = document.getElementById('mode_icon');
const timeDisplay = document.querySelector('.player_music_time');
const progressBar = document.querySelector('.player_progress');
const progressPlay = document.querySelector('.player_progress_play');
const voiceBar = document.querySelector('.player_voice_bar');
const voicePlay = document.querySelector('.player_voice_play');
const lyricsLines = document.querySelectorAll('.lyrics p');

let isPlaying = false;
let isProgressDragging  = false;
let isVoiceDragging = false;
let isLoading = false;
let isMute = false;

let songList = [
    '/include/只有我不行的恋爱.mp3',
    '/include/致我的思春期.mp3',
    // ... 其他歌曲
];

let currentSongIndex = Math.floor(Math.random() * songList.length);

let playModeOrder = 0;
let playModeSingle = 1;
let playModeRandom = 2;
let playModeList = 3;
let currentPlayMode = playModeOrder; // 假设初始播放模式为顺序播放

let currentLine = 0;    // 歌词
let currentVolume = 50;
let previousSongIndex = currentSongIndex;
let newTimeWhenDragged = 0; // 用于存储拖动时的播放时间
let duration;

// 播放模式管理器
const playModeManager = {
    modes: {
        [playModeOrder]: {
            nextSong: (songList, currentSongIndex) => (currentSongIndex + 1) % songList.length,
            prevSong: (songList, currentSongIndex) => (currentSongIndex - 1 + songList.length) % songList.length
        },
        [playModeSingle]: {
            nextSong: (songList, currentSongIndex) => currentSongIndex,
            prevSong: (songList, currentSongIndex) => currentSongIndex
        },
        [playModeRandom]: {
            nextSong: (songList) => Math.floor(Math.random() * songList.length),
            prevSong: (songList) => Math.floor(Math.random() * songList.length)
        },
        [playModeList]: {
            nextSong: (songList, currentSongIndex) => (currentSongIndex + 1) % songList.length,
            prevSong: (songList, currentSongIndex) => (currentSongIndex - 1 + songList.length) % songList.length
        }
    },
    getNextSongIndex: function() {
        return this.modes[currentPlayMode].nextSong(songList, currentSongIndex);
    },
    getPrevSongIndex: function() {
        return this.modes[currentPlayMode].prevSong(songList, currentSongIndex);
    }
};
// 加载歌曲
function loadSong(songIndex) {
    isLoading = true;
    if (songList.length > 0) {
        audioPlayer.src = songList[songIndex];
        // pauseSong();
        audioPlayer.addEventListener('durationchange', function() {
            const duration = Math.floor(audioPlayer.duration);
            updateTimeDisplay(0, duration);
        });
        updateVolume(currentVolume);
        updateMusicInfo(songIndex); // 更新音乐信息
        // updateLyrics(0);
        highlightCurrentSong(songIndex);
    }
    isLoading = false;
}
// 更新音乐信息的函数
function updateMusicInfo(songIndex) {
    const songName = songList[songIndex].split('/').pop().split('.mp3')[0]; // 从文件路径中提取歌名
    const musicInfoElement = document.querySelector('.player_music_info');
    musicInfoElement.textContent = songName; // 更新歌名
}
function playSong() {
    isPlaying = true;
    audioPlayer.play();
    playIcon.classList.remove('bi-play-circle');
    playIcon.classList.add('bi-pause-circle');
    
}
function pauseSong() {
    isPlaying = false;
    audioPlayer.pause();
    playIcon.classList.remove('bi-pause-circle');
    playIcon.classList.add('bi-play-circle');
    
}

// 上一首歌曲
function prevSong() {
    currentSongIndex = playModeManager.getPrevSongIndex();
    loadSong(currentSongIndex);
    playSong();
}

function togglePlay() {
    if (isPlaying) {
        pauseSong();
    } else {
        loadSong(currentSongIndex);
        playSong();
    }
}

// 下一首歌曲
function nextSong() {
    currentSongIndex = playModeManager.getNextSongIndex();
    loadSong(currentSongIndex);
    playSong();
}

function toggleMode() {
    // 根据当前播放模式切换到下一个模式
    switch (currentPlayMode) {
        case playModeOrder:
            currentPlayMode = playModeSingle;
            break;
        case playModeSingle:
            currentPlayMode = playModeRandom;
            break;
        case playModeRandom:
            currentPlayMode = playModeList;
            break;
        case playModeList:
            currentPlayMode = playModeOrder;
            break;
        default:
            currentPlayMode = playModeOrder; // 如果是未知模式，重置为顺序播放
            break;
    }
    // 根据切换后的播放模式更新UI（这里假设有一个函数updatePlayModeUI）
    updatePlayModeUI(currentPlayMode);
}

// 假设有一个函数来更新播放模式的UI，例如图标或文本
function updatePlayModeUI(mode) {
    // 根据播放模式更新UI元素，以下代码仅为示例
    let modeIcon = document.getElementById('mode_icon'); // 假设有一个元素用于显示播放模式图标
    // let modeText = document.getElementById('modeText'); // 假设有一个元素用于显示播放模式文本

    switch (mode) {
        case playModeOrder:
            modeIcon.classList.remove('bi-shuffle', 'bi-repeat-1', 'bi-repeat');
            modeIcon.classList.add('bi-list');
            // modeText.textContent = '顺序播放';
            break;
        case playModeSingle:
            modeIcon.classList.remove('bi-list', 'bi-shuffle', 'bi-repeat');
            modeIcon.classList.add('bi-repeat-1');
            // modeText.textContent = '单曲循环';
            break;
        case playModeRandom:
            modeIcon.classList.remove('bi-list', 'bi-repeat-1', 'bi-repeat');
            modeIcon.classList.add('bi-shuffle');
            // modeText.textContent = '随机播放';
            break;
        case playModeList:
            modeIcon.classList.remove('bi-list', 'bi-shuffle', 'bi-repeat-1');
            modeIcon.classList.add('bi-repeat');
            // modeText.textContent = '列表循环';
            break;
    }
}


audioPlayer.addEventListener('timeupdate', () => {
    if (!isProgressDragging  && !isLoading) {
        const currentTime = Math.floor(audioPlayer.currentTime);
        duration = Math.floor(audioPlayer.duration);
        updateTimeDisplay(currentTime, duration);
        updateLyrics(currentTime);
    }

});

function updateTimeDisplay(currentTime, duration){
    const minutesCurrent = String(Math.floor(currentTime / 60)).padStart(2, '0');
    const secondsCurrent = String(Math.floor(currentTime % 60)).padStart(2, '0');
    const minutesDuration = String(Math.floor(duration / 60)).padStart(2, '0');
    const secondsDuration = String(duration % 60).padStart(2, '0');

    timeDisplay.textContent = `${minutesCurrent}:${secondsCurrent} / ${minutesDuration}:${secondsDuration}`;

    const progressPercent = (currentTime / duration) * 100;
    progressPlay.style.width = `${progressPercent}%`;

}
function volumeMute() {
    audioPlayer.muted = true;
    // audioPlayer.volume = 0;
    voiceIcon.classList.remove('bi-volume-up-fill');
    voiceIcon.classList.add('bi-volume-mute-fill');
    isMute = true;
}
function volumeMuteNo() {
    audioPlayer.muted = false;
    audioPlayer.volume = currentVolume / 100;
    // console.log(currentVolume);
    voiceIcon.classList.remove('bi-volume-mute-fill');
    voiceIcon.classList.add('bi-volume-up-fill');
    isMute = false;
}

function updateVolume(value) {
    currentVolume = value;
    // console.log(currentVolume);
    const volumePercent = value / 100;
    audioPlayer.volume = volumePercent;
    voicePlay.style.width = `${volumePercent * 100}%`;
}

function toggleMute() {
    if (isMute) {
        volumeMuteNo();
        updateVolume(currentVolume);
    } else {
        volumeMute();
        audioPlayer.volume = 0;
        voicePlay.style.width = `0%`;
    }
}

function updateLyrics(currentTime) {
    lyricsLines.forEach((line, index) => {
        const timestamp = parseFloat(line.getAttribute('data-time'));
        if (timestamp <= currentTime && currentTime < timestamp + 2) {
            line.classList.add('current-line');
            if (index !== currentLine) {
                lyrics.scrollTo({
                    top: line.offsetTop - lyrics.offsetHeight / 2 + line.offsetHeight / 2,
                    behavior: 'smooth'
                });
                currentLine = index;
            }
        } else {
            line.classList.remove('current-line');
        }
    });
}
// 点击进度条时更改播放进度
progressBar.addEventListener('click', (e) => {
    // 获取进度条容器的位置和尺寸信息
    const rect = progressBar.getBoundingClientRect();
    // 计算点击位置相对于进度条容器的位置比例
    const position = (e.clientX - rect.left) / rect.width;
    // 根据比例计算新的播放时间
    const newTime = position * audioPlayer.duration;
    // 更新音频播放器的当前时间
    audioPlayer.currentTime = newTime;
    playSong();
});
progressBar.addEventListener('mousedown', () => {
    isProgressDragging  = true;
});


// 监听文档的mousemove事件，用于处理拖动操作
progressBar.addEventListener('mousemove', (e) => {
    // 如果正在拖动进度条
    let newTime;
    if (isProgressDragging ) {
        // 获取进度条容器的位置和尺寸信息
        const rect = progressBar.getBoundingClientRect();
        // 计算鼠标位置相对于进度条容器的位置比例
        const position = (e.clientX - rect.left) / rect.width;
        // 根据比例计算新的播放时间
        newTime = position * audioPlayer.duration;
        // 更新音频播放器的当前时间
        updateTimeDisplay(newTime, duration);
    }
    if (this.timeUpdateTimeout) {
        clearTimeout(this.timeUpdateTimeout); // 清除之前的定时器
    }
    this.timeUpdateTimeout = setTimeout(() => {
        audioPlayer.currentTime = newTime;
    }, 100); // 延迟100毫秒执行
});

voiceBar.addEventListener('click', (e) => {
    const rect = voiceBar.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    updateVolume(position * 100);
});

voiceBar.addEventListener('mousedown', () => {
    isVoiceDragging  = true;
});

voiceBar.addEventListener('mousemove', (e) => {
    if (isVoiceDragging) {
        const rect = voiceBar.getBoundingClientRect();
        const position = (e.clientX - rect.left) / rect.width;
        updateVolume(position*100);
    }

});

document.addEventListener('mouseup', () => {

    isVoiceDragging  = false;
    isProgressDragging  = false;

});



// 假设您有一个函数来获取当前播放歌曲的封面URL
function getCurrentSongCoverUrl() {
    // 这里应该是获取当前歌曲封面URL的逻辑
    // 例如，根据当前播放的歌曲信息来返回封面URL
    // 这里只是一个示例，您需要根据实际情况来编写
    return 'path-to-current-album-cover.jpg';
}

// 更新音乐播放器背景图片的函数
function updatePlayerBackground() {
    var playerElement = document.getElementById('music-player');
    var coverUrl = getCurrentSongCoverUrl(); // 获取当前歌曲的封面URL
    playerElement.style.backgroundImage = 'url("' + coverUrl + '")'; // 更新背景图片
}

// 当歌曲切换时，调用此函数来更新背景
// 例如，在播放器的事件监听器中调用此函数
// audioPlayer.on('songChange', updatePlayerBackground);

// Initialize shuffled indices and load first song

loadSong(currentSongIndex);