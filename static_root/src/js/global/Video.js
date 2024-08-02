class Video {
  constructor() {
   // this._options = options || {};
    //this.container = typeof options.container === "undefined" ? document.body : this._options.container;
    this.video = document.querySelector("#video-intro-1");
    this.playButton = document.querySelector(".icon-1hiJo9K");
    console.log("this play button", this.playButton);
    this.pauseButton = document.querySelector(".icon-IOxSc_E");
    this.muteButton = document.querySelector(".icon-IOxSc_E");
    this.settings();
    this.onVideoEvent();
  }

  // APP SETTINGS
  settings() {
    let that = this;
    this._settings = {  
      enableAu: false,
      enableVid: false,
      loop: true,
      volume: 0.5,
    };
  }

  onVideoEvent() {
    this.playButton.addEventListener('click', (e)=>this.bindVideoEvent(e));
    this.pauseButton.addEventListener('click', (e)=>this.bindVideoEvent(e));
    this.muteButton.addEventListener('click', (e)=>this.bindAudioEvent(e));
  }

  bindVideoEvent(e) {
    console.log('this is fired bind video event')
      if (e) this._settings.enableAu = true
      else this._settings.enableAu = false;
      this.setVideoEvent();
  }

  bindAudioEvent(e) {
      if (e) this._settings.enableVid = true
      else this._settings.enableVid = false;
      this.setAudioEvent();
  }

  setVideoEvent() {
    if(this._settings.enableVid) {
      this.video.play();
      this.playButton.style.display = "none";
      this.video.muted = false;
    } else {
      this.video.pause();
    }
    this.video.loop = this._settings.loop;
  }

  setAudioEvent() {
    if(this._settings.enableAu) this.video.muted = true;
    else this.video.muted = false;
  }
}

//Load Video
const initVideo = () => {
    new Video();
};

if ( document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll))
    preloadAudio();
else
  document.addEventListener("DOMContentLoaded", initVideo ); 


 