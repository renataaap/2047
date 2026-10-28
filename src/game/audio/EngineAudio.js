export class EngineAudio {
  async start(volume) {
    if(this.context){await this.context.resume();return;}
    const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
    const c=this.context=new Ctx();this.master=c.createGain();this.master.gain.value=volume*.25;this.master.connect(c.destination);
    this.filter=c.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=340;this.gain=c.createGain();this.gain.gain.value=0;this.filter.connect(this.gain);this.gain.connect(this.master);
    this.osc=[];for(const [i,mul] of [1,2,4].entries()){const o=c.createOscillator();o.type=i===0?'sawtooth':'triangle';o.frequency.value=28*mul;o.connect(this.filter);o.start();this.osc.push(o);}
    const buffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate),a=buffer.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;
    this.noise=c.createBufferSource();this.noise.buffer=buffer;this.noise.loop=true;
    const windFilter=c.createBiquadFilter();windFilter.type='lowpass';windFilter.frequency.value=550;this.wind=c.createGain();this.wind.gain.value=.018;this.noise.connect(windFilter);windFilter.connect(this.wind);this.wind.connect(this.master);const rf=c.createBiquadFilter();rf.type='highpass';rf.frequency.value=1800;this.rain=c.createGain();this.rain.gain.value=0;this.noise.connect(rf);rf.connect(this.rain);this.rain.connect(this.master);const radioFilter=c.createBiquadFilter();radioFilter.type='bandpass';radioFilter.frequency.value=1600;this.radio=c.createGain();this.radio.gain.value=0;this.noise.connect(radioFilter);radioFilter.connect(this.radio);this.radio.connect(this.master);this.alert=c.createOscillator();this.alert.frequency.value=760;this.alertGain=c.createGain();this.alertGain.gain.value=0;this.alert.connect(this.alertGain);this.alertGain.connect(this.master);this.alert.start();this.noise.start();await c.resume();
  }
  update(state,input,volume,paused){const c=this.context;if(!c)return;const now=c.currentTime,load=Math.abs(input.throttle||0),rpm=28+state.speed*.95+load*9;this.osc.forEach((o,i)=>o.frequency.setTargetAtTime(rpm*[1,2,4][i],now,.1));this.gain.gain.setTargetAtTime(state.engineOn&&!paused?.1+load*.04:0,now,.15);this.wind.gain.setTargetAtTime(paused?0:.018+state.speed*.002+(state.storm?.14:0),now,.2);this.rain?.gain.setTargetAtTime(!paused&&state.restored?.13:0,now,.7);this.radio?.gain.setTargetAtTime(state.radioActive?(state.storm?.09:.025):0,now,.1);this.alertGain?.gain.setTargetAtTime(state.cargoRisk&&!paused&&Math.sin(now*10)>0?.045:0,now,.02);this.master.gain.setTargetAtTime(volume*.25,now,.08);}
  dispose(){this.osc?.forEach(o=>o.stop());this.noise?.stop();this.alert?.stop();this.context?.close();}
}
