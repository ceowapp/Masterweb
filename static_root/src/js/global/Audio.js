export default class Audio {
  constructor(options) {
    this._options = options || {};
    this.container = typeof options.container === "undefined" ? document.body : this._options.container;
    this.audio = document.querySelector("audio");
    console.log("this audio", this.audio)
    this.settings();
    this.onAudioEvent();
  }

  // APP SETTINGS
  settings() {
    let that = this;
    this._settings = {  
      enable: false,
      loop: false,
      volume: 0.5,
    };
  }

  onAudioEvent() {
    this.container.addEventListener('mouseenter', (e)=>this.bindEvent(e));
  }

  bindEvent(e) {
      if (e) this._settings.enable = true
      else this._settings.enable = false;
    console.log("this is fired")
      this.setEvent();
  }

  setEvent() {
    if(this._settings.enable) this.audio.play();
    else this.audio.pause();
    this.audio.loop = this._settings.loop;
    this.audio.volume = this._settings.volume;
  }
}

 