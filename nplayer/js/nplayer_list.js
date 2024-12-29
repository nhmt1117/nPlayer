let playList = document.getElementById('player_list');
let playListBd = document.querySelector('.play_list_bd');
// 清空现有内容
playListBd.innerHTML = '';

// 遍历 songList 数组，为每首歌曲创建一个列表项
songList.forEach((song, index) => {
    // 提取歌曲名称（假设歌曲文件名格式为 '路径/歌曲名称-歌手.mp3'）
    let songName = song.split('/').pop().split('.')[0];
    // 创建一个新的列表项
    let listItem = document.createElement('li');
    // 设置列表项的文本内容为歌曲名称
    listItem.textContent = songName;
    listItem.setAttribute('songIndex', index);
    listItem.addEventListener('dblclick', function() {
        loadSong(index); // 调用播放函数
        playSong();
         
    });
    // 将列表项添加到播放列表容器中
    playListBd.appendChild(listItem);
});

function openPlayList() {
    playList.style.display = playList.style.display === 'block' ? 'none' : 'block';
    playLyrics.style.display = playLyrics.style.display === 'block' ? 'none' : 'block';
}

// 高亮显示当前播放的歌曲
function highlightCurrentSong(index) {
    // 移除之前高亮的歌曲
    if (previousSongIndex !== -1) {
        let previousItem = playListBd.children[previousSongIndex];
        if (previousItem) {
            previousItem.classList.remove('highlight');
        }
    }
    // 高亮当前歌曲
    let currentItem = playListBd.children[index];
    if (currentItem) {
        currentItem.classList.add('highlight');
    }
    previousSongIndex = currentSongIndex;
}

// // 监听整个文档的点击事件
// document.addEventListener('click', function(event) {
//     let btnPlayList = document.getElementById('list_icon');
    
//     // 检查点击事件是否发生在播放列表或播放列表按钮之外
//     if (!playList.contains(event.target) && !btnPlayList.contains(event.target)) {
//       // 如果是，则关闭播放列表
//       playList.style.display = 'none';
//     }
// });


