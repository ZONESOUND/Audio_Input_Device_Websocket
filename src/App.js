import React, {Component}  from 'react';
import P5Wrapper from 'react-p5-wrapper';
import sketch from './sketch';
import './App.css';

class App extends Component {

  constructor() {
    super();
    var AudioContext = window.AudioContext // Default
          || window.webkitAudioContext // Safari and old versions of Chrome
          || false; 

    this.state = {
      timer: null,
      style: {},
      btnTxt: 'START',
      context: AudioContext? new AudioContext() : null,
    }
    
  }

  btnClick = () => {
    navigator.mediaDevices.getUserMedia({audio: true})
        .then(this.micStart, this.micError);
  }

  micStart = (stream) => {

    this.setState({style:{display:'none'}});
    let {context} = this.state;
    var microphone = context.createMediaStreamSource(stream);
    var analyser = context.createAnalyser();
    microphone.connect(analyser);
    //analyser.connect(context.destination);
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(analyser.fftSize);

    this.setState ({
      analyser : analyser,
      dataArray: dataArray,
      bufferLength: bufferLength,
      
    });
    //this.update();
  }

  micError = () => {
    this.setState({btnTxt:'RE-EANBLE!'});
    console.log('error');
  }

  update = () => {
    let {dataArray, analyser} = this.state;
    console.log(dataArray);
    analyser.getByteFrequencyData(dataArray);
    //this.setState({timer:setTimeout(this.update,200)});
  }

  render() {

    return (
      <div>
        <div id="wrap" style={this.state.style}>
          <button onClick={this.btnClick}>{this.state.btnTxt}</button>
        </div>
        <P5Wrapper sketch={sketch} analyser={this.state.analyser} 
           bufferLength={this.state.bufferLength}/>
      </div>
    );
  }
}

export default App;