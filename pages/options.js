import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

import Button from "../components/button";
import HomeButton from "../components/homeButton";

export default function Home() {
  const router = useRouter();

  const [showButton, setShowButton] = useState(false);
  const [showDescription, setShowDescription] = useState("");
  const [isFadeOut, setIsFadeOut] = useState(false);

  const onOptionChanges = () => {
    const audio = new Audio("/set1.wav"); // Replace "tone.mp3" with the path to your audio file
    audio.play();
  };

  const handleVideoEnd = () => {
    setShowButton(true);
  };

  const subMenus = [
    "Options1",
    "Options2",
    "Options3",
    "Options4",
    "Options5",
    "Options6",
  ];

  useEffect(() => {
    const backgroundAudio = new Audio("./backgroundmusic.mp3");
    backgroundAudio.play();
    return () => {
      backgroundAudio.pause();
    };
  }, []);

  return (
    <div className="w-full h-screen overflow-x-hidden overflow-y-auto">
      <div className="relative w-full h-screen flex flex-col">
        <div className="absolute left-0 top-0 w-full h-screen overflow-hidden z-0">
          <div className="-left-4 -top-4 -right-4 -bottom-4">
            <video
              loop
              muted
              autoPlay
              playsInline
              className="w-full h-screen object-cover"
              src="/videos/sample.mp4"
              onEnded={handleVideoEnd}
            />
          </div>
        </div>
        <div className="relative w-full h-full flex items-start justify-start">
          <div className="relative w-1/2 h-full flex justify-center items-center">
            <div
              className={`relative w-full h-full items-start justify-center pt-16 ${
                isFadeOut
                  ? `opacity-0 transition-opacity duration-1000 ease-in-out hover:opacity-0`
                  : ""
              }`}
            >
              {subMenus.map((subMenu, index) => (
                <div className="relative w-full h-16 lg:h-24 items-center justify-center" key={index}>
                  <HomeButton
                    label={subMenu}
                    setDescription={(e) => {
                      setShowDescription(e);
                      onOptionChanges();
                    }}
                    setFadeEffect={(e) => {
                      setIsFadeOut(e);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="relative w-1/2 h-screen flex justify-center items-center">
            <div className="relative flex ">
              <Image
                className="absolute w-24 h-24 bottom-24 object-stretch border-spacing-2 border-transparent rounded-lg"
                src="/images/frame.png"
                width={450}
                height={280}
                alt=""
              />
              <p
                className="absolute left-1/2 bottom-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold font-font1
               text-amber-800"
              >
                {showDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
