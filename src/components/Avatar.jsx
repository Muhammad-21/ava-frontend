import { useAnimations, useFBX, useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { AnimationMixer, LineBasicMaterial, LinearEncoding, LoopOnce, MeshPhysicalMaterial, MeshStandardMaterial, Vector2, sRGBEncoding } from "three";
import createAnimation from "../utils/converter";
import blinkData from "../utils/blendDataBlink.json";


const Avatar = (props) => {
    const { text, setAudio, startSpeach, setLoader } = props
    let gltf = useGLTF('./model.glb');
    let morphTargetDictionaryBody = null;
    let morphTargetDictionaryLowerTeeth = null;
    let idleFbx = useFBX("./idle.fbx");
    let { clips: idleClips } = useAnimations(idleFbx.animations);
    const mixer = useMemo(() => new AnimationMixer(gltf.scene), [gltf.scene]);
    const [clips, setClips] = useState([]);
    const [
        bodyTexture,
        eyesTexture,
        teethTexture,
        bodySpecularTexture,
        bodyRoughnessTexture,
        bodyNormalTexture,
        teethNormalTexture,
        hairTexture,
        tshirtDiffuseTexture,
        tshirtNormalTexture,
        tshirtRoughnessTexture,
        hairAlphaTexture,
        hairNormalTexture,
        hairRoughnessTexture,
      ] = useTexture([
        "./images/body.webp",
        "./images/eyes.webp",
        "./images/teeth_diffuse.webp",
        "./images/body_specular.webp",
        "./images/body_roughness.webp",
        "./images/body_normal.webp",
        "./images/teeth_normal.webp",
        "./images/h_color.webp",
        "./images/tshirt_diffuse.webp",
        "./images/tshirt_normal.webp",
        "./images/tshirt_roughness.webp",
        "./images/h_alpha.webp",
        "./images/h_normal.webp",
        "./images/h_roughness.webp",
      ]);

      [
        bodyTexture,
        eyesTexture,
        teethTexture,
        teethNormalTexture,
        bodySpecularTexture,
        bodyRoughnessTexture,
        bodyNormalTexture,
        tshirtDiffuseTexture,
        tshirtNormalTexture,
        tshirtRoughnessTexture,
        hairAlphaTexture,
        hairNormalTexture,
        hairRoughnessTexture,
      ].forEach(t => {
        t.flipY = false
        t.encoding = sRGBEncoding
      })

      bodyNormalTexture.encoding = LinearEncoding;
      tshirtNormalTexture.encoding = LinearEncoding;
      teethNormalTexture.encoding = LinearEncoding;
      hairNormalTexture.encoding = LinearEncoding;


      gltf.scene.traverse((node) => {
        if (
          node.type === "Mesh" ||
          node.type === "LineSegments" ||
          node.type === "SkinnedMesh"
        ) {
          node.castShadow = true;
          node.receiveShadow = true;
          node.frustumCulled = false;
    
          if (node.name.includes("Body")) {
            node.castShadow = true;
            node.receiveShadow = true;
    
            node.material = new MeshPhysicalMaterial();
            node.material.map = bodyTexture;
            node.material.shininess = 60;
            node.material.roughness = 1.7;
    
            node.material.roughnessMap = bodyRoughnessTexture;
            node.material.normalMap = bodyNormalTexture;
            node.material.normalScale = new Vector2(0.6, 0.6);
    
            morphTargetDictionaryBody = node.morphTargetDictionary;
    
            node.material.envMapIntensity = 0.8;
            // node.material.visible = false;
          }
    
          if (node.name.includes("Eyes")) {
            node.material = new MeshStandardMaterial();
            node.material.map = eyesTexture;
            node.material.roughness = 0.1;
            node.material.envMapIntensity = 0.5;
          }
    
          if (node.name.includes("Brows")) {
            node.material = new LineBasicMaterial({ color: 0x000000 });
            node.material.linewidth = 1;
            node.material.opacity = 0.5;
            node.material.transparent = true;
            node.visible = false;
          }
    
          if (node.name.includes("Teeth")) {
            node.receiveShadow = true;
            node.castShadow = true;
            node.material = new MeshStandardMaterial();
            node.material.roughness = 0.1;
            node.material.map = teethTexture;
            node.material.normalMap = teethNormalTexture;
    
            node.material.envMapIntensity = 0.7;
          }
    
          if (node.name.includes("Hair")) {
            node.material = new MeshStandardMaterial();
            node.material.map = hairTexture;
            node.material.alphaMap = hairAlphaTexture;
            node.material.normalMap = hairNormalTexture;
            node.material.roughnessMap = hairRoughnessTexture;
    
            node.material.transparent = true;
            node.material.depthWrite = false;
            node.material.side = 2;
            node.material.color.setHex(0x000000);
    
            node.material.envMapIntensity = 0.3;
          }
    
          if (node.name.includes("TSHIRT")) {
            node.material = new MeshStandardMaterial();
    
            node.material.map = tshirtDiffuseTexture;
            node.material.roughnessMap = tshirtRoughnessTexture;
            node.material.normalMap = tshirtNormalTexture;
            node.material.color.setHex(0xffffff);
    
            node.material.envMapIntensity = 0.5;
          }
    
          if (node.name.includes("TeethLower")) {
            morphTargetDictionaryLowerTeeth = node.morphTargetDictionary;
          }
        }
      });
  
    useEffect(() => {
      const host = 'https://ava-backend-nm0p.onrender.com'
      if(text.length){
        setLoader(true)
        fetch(host + '/talk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({text: text})
        }).then(res => res.json()).then(data => {
        const { blendData, filename } = data
        setAudio(host + filename)
        let newClips = [
          createAnimation(blendData, morphTargetDictionaryBody, "HG_Body"),
          createAnimation(
            blendData,
            morphTargetDictionaryLowerTeeth,
            "HG_TeethLower",
          ),
        ];
        setClips(newClips);
      })
    }
    }, [morphTargetDictionaryBody, morphTargetDictionaryLowerTeeth, setAudio, setLoader, text]);

    useEffect(() => {
      startSpeach && clips.forEach((clip) => {
        let clipAction = mixer.clipAction(clip);
        clipAction.setLoop(LoopOnce);
        clipAction.play();
      });
    }, [clips, mixer, startSpeach]);

        idleClips[0].tracks = idleClips[0].tracks.filter((track) => {
            return (
            track.name.includes("Head") ||
            track.name.includes("Neck") ||
            track.name.includes("Spine2")
            );
        });

      idleClips[0].tracks = idleClips[0].tracks.map((track) => {
        if (track.name.includes("Head")) {
          track.name = "head.quaternion";
        }
    
        if (track.name.includes("Neck")) {
          track.name = "neck.quaternion";
        }
    
        if (track.name.includes("Spine")) {
          track.name = "spine2.quaternion";
        }
    
        return track;
      });
    
      useEffect(() => {
        let idleClipAction = mixer.clipAction(idleClips[0]);
        idleClipAction.play();
    
        let blinkClip = createAnimation(
          blinkData,
          morphTargetDictionaryBody,
          "HG_Body",
        );
        let blinkAction = mixer.clipAction(blinkClip);
        blinkAction.play();
      }, [idleClips, mixer, morphTargetDictionaryBody]);

    useFrame((state, delta) => {
        mixer.update(delta);
    });

    return (
            <group name="avatar">
                <primitive object={gltf.scene} />
            </group>
    )
}

export default Avatar