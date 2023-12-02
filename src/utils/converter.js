import { AnimationClip, NumberKeyframeTrack } from "three";

var fps = 60;

function modifiedKey(key) {
  const specialKeys = [
    "eyeLookDownLeft",
    "eyeLookDownRight",
    "eyeLookInLeft",
    "eyeLookInRight",
    "eyeLookOutLeft",
    "eyeLookOutRight",
    "eyeLookUpLeft",
    "eyeLookUpRight"
  ];

  if (specialKeys.includes(key)) {
    return key;
  }

  if (key.endsWith("Right")) {
    return key.replace("Right", "_R");
  }

  if (key.endsWith("Left")) {
    return key.replace("Left", "_L");
  }

  return key;
}

function createAnimation(recordedData, morphTargetDictionary, bodyPart) {
  if (recordedData.length === 0) {
    return null;
  }
 
  const animation = Object.keys(morphTargetDictionary).map(() => []);
  const time = [];
  let finishedFrames = 0;

  for (const d of recordedData) {
    for (const [key, value] of Object.entries(d.blendshapes)) {
      const modified = modifiedKey(key);
      if (modified in morphTargetDictionary) {
        let modifiedValue = value;
        if (key === "mouthShrugUpper") {
          modifiedValue += 0.4;
        }
        animation[morphTargetDictionary[modified]].push(modifiedValue);
      }
    }
    time.push(finishedFrames / fps);
    finishedFrames++;
  }

  const tracks = Object.keys(recordedData[0].blendshapes)
    .map((key) => {
      const modified = modifiedKey(key);
      if (modified in morphTargetDictionary) {
        const i = morphTargetDictionary[modified];
        return new NumberKeyframeTrack(
          `${bodyPart}.morphTargetInfluences[${i}]`,
          time,
          animation[i]
        );
      }
    })
    .filter((track) => track !== undefined);

  return new AnimationClip("animation", -1, tracks);
}

export default createAnimation;
