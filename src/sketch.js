import { emitOSC } from "./socketUsage";

export default function sketch (p) {
    let analyser;
    let frameCount = 0;
    let timeDataArray = [];
    let freqDataArray = [];
    let btnClick;
    let button;
    let bufferLength;
    let bgColor = [0, 0, 0];

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.frameRate(30);
    };

    p.windowResized = () =>  {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }

    p.myCustomRedrawAccordingToNewPropsHandler = (props) => {
        
        if (props.bufferLength) {
            bufferLength = props.bufferLength;
        }
        if (props.analyser) {
            if (props.analyser == null) return;
            analyser = props.analyser;
            timeDataArray = new Uint8Array(analyser.fftSize);
            freqDataArray = new Uint8Array(analyser.fftSize);
        }
        if (props.btnClick) {
            btnClick = props.btnClick;
            
            if (button) button.mousePressed(btnClick);
        }
    };

    p.draw = function () {
        frameCount++;

        if (analyser !== undefined) {
            getAnalysedData();
            getTimeDomainData();
        }

        p.background(bgColor[0], bgColor[1], bgColor[2], 50);
        if (timeDataArray.length <= 0) return;
        
        var ths = 50;
        var freq = getFreq(ths);
        var maxDb = Math.max(...freqDataArray)/256.;
        
        
        if (maxDb > ths/255. && frameCount % 10 === 0) {
            emitOSC('/sound', {f: freq, d: maxDb});
        }
        
        //drawTimeWave();
        drawCircle(maxDb, freq);

        p.textSize(15);
        p.fill(200);
        p.textAlign(p.CENTER);
        p.text('MAKE SOUND', p.windowWidth/2, p.windowHeight - 50);
        
    };

    function drawCircle(db, freq) {
        p.push()
        p.translate(p.windowWidth / 2, p.windowHeight / 2);
        
        let mul = p.map(db, 0, 1, 40, 50);
        let r = p.map(db, 0, 1, 30, 70);

        // p.stroke(50);
        // p.beginShape(p.TRIANGLE_STRIP);
        // drawCircleInner(r, mul, 0, true);
        // p.endShape();

        let h = Math.floor(p.map(freq, 100, 2000, 0, 360, true));
        let s = Math.floor(p.map(db, 0.2, 1, 0, 50, true));
        console.log(h, s);
        p.stroke(`hsl(${h}, ${s}%, 50%)`);
        //p.stroke(255);

        p.fill(bgColor[0], bgColor[1], bgColor[2]);
        p.beginShape();
        drawCircleInner(r, mul);
        p.endShape(p.CLOSE);

        //p.fill(255,255,255,100);
        p.fill(`hsla(${h}, ${s}%, 90%, 0.5)`)
        for (let i=0; i<30; i++) {
            p.noStroke();
            p.beginShape();
            drawCircleInner(r-4-i*2, mul);
            p.endShape(p.CLOSE);
            //p.fill(`hsla(${h}, 100%, 50%, 0.05)`)
            //p.fill(0,0,0,10);
            p.fill(bgColor[0], bgColor[1], bgColor[2], 10);
        }
        
        p.pop()
    }

    function drawCircleInner(r, mul) {

        let cut = 16;
        let sliceDeg = cut*2*Math.PI / bufferLength;
        let deg = 0;
        let start;
        for (let i=0; i<bufferLength; i+=cut) {
            let sum = 0;
            let total = 0;
            for (let j=i; j<i+cut && j<bufferLength; j++) {
                sum += timeDataArray[j];
                total ++;
            }
            sum /= total;
            let v = (sum / 128.0)*mul;
            let x = (r+v) * Math.sin(deg);
            let y = (r+v) * Math.cos(deg);
            // let x1 = (r+dis+v) * Math.sin(deg);
            // let y1 = (r+dis+v) * Math.cos(deg);
            // p.push()
            //     p.noStroke();
            //     p.fill(255,255,255,100);
            //     p.ellipse(x,y,5);
            // p.pop()
            //p.curveVertex(x, y);
            
            //let h = Math.floor(360*deg/(2*Math.PI));
            //let s = p.map(sum, 0, 256, 0, 30);
            //if (tri) p.stroke(`hsl(${h}, 20%, 50%)`);
            p.curveVertex(x, y);
            //if (tri) p.vertex(x1, y1);
            if (i === 0) {
                //start = [x, y, x1, y1];
                start = [x, y];
            }

            deg += sliceDeg;
        }
        p.vertex(start[0], start[1]);
        //if (tri) p.vertex(start[2], start[3]);
        //p.endShape(p.CLOSE)
        p.endShape()
    }

    function drawTimeWave() {
        p.stroke(126);
        p.fill(0);

        let sliceWidth = p.windowWidth * 1.0 / bufferLength;
        let x = 0;
        let prev;
        for(var i = 0; i < bufferLength; i++) {
    
            var v = timeDataArray[i] / 128.0;
            var y = v * p.windowHeight/2;

            if(i !== 0) {
                p.line(prev[0], prev[1], x, y);
            }
            prev = [x, y];

            x += sliceWidth;
        }
        p.line(prev[0], prev[1], p.windowWidth, p.windowHeight/2);
    }

    function getAnalysedData() {
        //console.log("getAnalysedData");
        analyser.getByteFrequencyData(freqDataArray);
        //console.log(freqDataArray);
    }

    function getTimeDomainData() {
        analyser.getByteTimeDomainData(timeDataArray);
        //console.log(timeDataArray);
    }

    function getFreq(threshold) {
        var fs = 44100;
        // var N = freqDataArray.frequencyBinCount;
        //console.log(fs, N);
        var max = Math.max(...freqDataArray);
        var fftMax = freqDataArray.indexOf(max) * fs / (2*bufferLength);
        return max > threshold ? Math.floor(fftMax) : 0;
    }
};

