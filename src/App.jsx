import { Environment, Loader, OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber"
import { Suspense, useState } from "react";
import Avatar from "./components/Avatar";
import './App.css';
import ReactAudioPlayer from "react-audio-player";
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import MicrophoneSvg from "./assets/Microphone";


function App() {
  const [text, setText] = useState('');
  const [audio, setAudio] = useState(null);
  const [loader, setLoader] = useState(false);
  const [startSpeach, setStartSpeach] = useState(false);
  const [bgMcrColor, setBgMcrColor] = useState(false);

  const bgStyle = {
    backgroundColor: '#FA6D20',
    borderRadius: '50%',
    cursor: 'pointer',
    fill: 'white'
  };

  const recognizeSpeech = () => {
    setBgMcrColor(!bgMcrColor);
    if (bgMcrColor) {
      cancelSpeech();
    }
    const token = import.meta.env.VITE_PUBLIC_SMARTAPP_KEY;
    const region = import.meta.env.VITE_PUBLIC_SMARTAPP_REGION;
    const speechConfig = sdk.SpeechConfig.fromSubscription(token, region);
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

    speechConfig.speechRecognitionLanguage = 'ru-RU';

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    recognizer.recognizeOnceAsync((result) => {
      if (result.text) {
        setText(result.text);
      }
      setBgMcrColor(false);
      recognizer.close();
    });
  };

  const cancelSpeech = () => {
    setStartSpeach(false);
    setLoader(false);
    setText('');
    setAudio(null);
  };

  return (
    <div>
      <div className="microphone">
        {loader && <div className="loader" onClick={cancelSpeech}></div>}
        {!loader && (
          <div onClick={recognizeSpeech} style={bgMcrColor ? bgStyle : null}>
            <MicrophoneSvg />
          </div>
        )}
      </div>
      <ReactAudioPlayer
        src={audio}
        onPlay={() => setStartSpeach(true)}
        onEnded={cancelSpeech}
        autoPlay={loader}
      />
      <Canvas
        dpr={2}
        onCreated={(ctx) => {
          ctx.gl.physicallyCorrectLights = true;
        }}
      >
        <OrthographicCamera makeDefault zoom={900} position={[0, 1.6, 1]} />
        <Suspense fallback={null}>
          <Environment background={false} files="./images/photo_studio_loft_hall_1k.hdr" />
        </Suspense>
        <Suspense fallback={null}>
          <Avatar setAudio={setAudio} setLoader={setLoader} startSpeach={startSpeach} text={text} />
        </Suspense>
      </Canvas>
      <Loader dataInterpolation={() => `Загрузка...`} />
    </div>
  );
}

export default App
