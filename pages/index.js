import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

import Button from "../components/firstButton";

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

  return (
    <div className="w-full h-screen overflow-x-hidden overflow-y-auto">
      <div className="relative w-full h-screen flex flex-col">
        <div className="absolute left-0 top-0 w-full h-screen overflow-hidden z-0">
          <div className="-left-4 -top-4 -right-4 -bottom-4">
            <video
              muted
              autoPlay
              playsInline
              className="w-full h-screen object-cover"
              src="/videos/sample.mp4"
              onEnded={handleVideoEnd}
            />
          </div>
        </div>
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute bottom-10 right-10 z-10">
            <Button
              label="Skip to mainland"
              onClick={() => router.push("/main")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
