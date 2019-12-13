/* Tesla Cam Player by BitJunky https://github.com/gigajunky */

function $(query) { return document.querySelector(query) }
let vidA = document.querySelectorAll('video')
  , vidL = $('#vidL')
  , vidF = document.querySelector('#vidF')
  , vidR = document.querySelector('#vidR')
  , vidB = document.querySelector('#vidB') 
  , play = document.querySelector('.play')
  , rwd = document.querySelector('.rwd')
  , fwd = document.querySelector('.fwd')
  , slider = document.querySelector(".slider")
  //, tbClipPath = document.querySelector('#tbClipPath')
  , currentClipIndex = 0
  , intervalFwd, intervalRwd
  , skipInterval = 200, skipTime = 3
  , clips = []
  , files = []

function loadClip(i) {
  console.log('loadclip2: ', i)
  clipName = clips[i]
  document.querySelector('#currentFile').innerHTML = clipName
  clipFiles = files.filter((file) => { return file.name.substring(0,16) == clipName } )
  clipL = clipFiles.filter((file) => { return file.name.indexOf("left_repeater") > 0 } )
  clipF = clipFiles.filter((file) => { return file.name.indexOf("front") > 0 } )
  clipR = clipFiles.filter((file) => { return file.name.indexOf("right_repeater") > 0 } )
  clipB = clipFiles.filter((file) => { return file.name.indexOf("back") > 0 } )

  vidL.src = (clipL.length)?URL.createObjectURL(clipL[0]):""
  vidF.src = (clipF.length)?URL.createObjectURL(clipF[0]):""
  vidR.src = (clipR.length)?URL.createObjectURL(clipR[0]):""
  vidB.src = (clipB.length)?URL.createObjectURL(clipB[0]):""
}

vidF.addEventListener('ended', function () {
  setTimeout(() => playNextMedia(), 100)
})
vidF.addEventListener('error', function () {
    console.log('Failed to load Video Clip.  Make sure clip path is correct.')
})


document.querySelector('.next').addEventListener('click', playNextMedia)
function playNextMedia() {
  if (currentClipIndex < clips.length - 1) {
    currentClipIndex++
    loadClip(currentClipIndex)
    playPauseMedia()
  }
}

document.querySelector('.prior').addEventListener('click', function () {
  if (currentClipIndex > 0) {
    currentClipIndex--
    loadClip(currentClipIndex)
    playPauseMedia()
  }
})

play.addEventListener('click', playPauseMedia)
function playPauseMedia() {
  if (vidF.paused) {
    play.setAttribute('data-icon', 'u')
    vidA.forEach(v => v.play())
  } else {
    play.setAttribute('data-icon', 'P')
    vidA.forEach(v => v.pause())
  }
}

document.querySelector('.stop').addEventListener('click', stopMedia)
function stopMedia() {
  vidA.forEach(v => {
    v.play()
    v.pause()
    v.currentTime = 0
  })
  play.setAttribute('data-icon', 'P')
}

rwd.addEventListener('click', function () {
  clearInterval(intervalFwd)
  fwd.classList.remove('active')

  if (rwd.classList.contains('active')) {
    rwd.classList.remove('active')
    clearInterval(intervalRwd)
    vidA.forEach(v => v.play())
  } else {
    rwd.classList.add('active')
    vidA.forEach(v => v.pause())
    intervalRwd = setInterval(windBackward, skipInterval)
  }
})

fwd.addEventListener('click', function () {
  clearInterval(intervalRwd)
  rwd.classList.remove('active')

  if (fwd.classList.contains('active')) {
    fwd.classList.remove('active')
    clearInterval(intervalFwd)
    vidF.play()
  } else {
    fwd.classList.add('active')
    vidF.pause()
    intervalFwd = setInterval(windForward, skipInterval)
  }
})

function windBackward() {
  if (vidF.currentTime <= skipTime) {
    rwd.classList.remove('active')
    clearInterval(intervalRwd)
    stopMedia()
  } else vidA.forEach(v => v.currentTime -= skipTime)
}

function windForward() {
  if (vidF.currentTime >= vidF.duration - skipTime) {
	playNextMedia()
  } else vidA.forEach(v => v.currentTime += skipTime)
}

vidF.addEventListener('timeupdate', function () {
  var minutes = Math.floor(vidF.currentTime / 60)
    , seconds = Math.floor(vidF.currentTime - minutes * 60)
    , minuteValue = minutes < 10 ? '0' + minutes : minutes
    , secondValue = seconds < 10 ? '0' + seconds : seconds
    , mediaTime = minuteValue + ':' + secondValue
    , barLength = document.querySelector('.timer').clientWidth * (vidF.currentTime / vidF.duration)
  document.querySelector('.timer span').textContent = mediaTime
  //document.querySelector('.timer div').style.width = barLength + 'px'
  slider.value = seconds
})

slider.addEventListener('input', function () {
  vidA.forEach(v => {
    v.currentTime = this.value
  })
})

document.getElementById("files").addEventListener("change", function (event) {
  files = Array.from(event.target.files)
  
  //console.log(files)
  
  clips = Array.from(new Set(files.map((file) => { return file.name.substring(0,16) })))
  
  currentClipIndex = 0
  loadClip(0)

}, false)
