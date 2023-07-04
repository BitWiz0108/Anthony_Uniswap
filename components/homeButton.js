import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

const HomeButton = ({ label, setDescription, setFadeEffect }) => {
  const [isImageVisible, setIsImageVisible] = useState(false);
  const router = useRouter();

  const handleMouseEnter = () => {
    setIsImageVisible(true);
    setDescription(label);
  };

  const handleMouseLeave = () => {
    setIsImageVisible(false);
  };

  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="relative w-full h-full flex flex-row"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative left-4">
        <Image
          className={`w-full h-full object-fit ${
            isImageVisible ? "opacity-100" : `opacity-0`
          }`}
          src="/images/123.png"
          width={400}
          height={95}
          alt=""
        />
        <p
          className={`absolute left-1/2 top-1/2 font-font1 transform -translate-x-1/2 -translate-y-1/2 -mt-3 sm:-mt-3 md:mt-2 lg:-mt-1 xl:-mt-1 text-xl md:text-2xl lg:text-3xl 
          xl:text-4xl text-amber-800 cursor-pointer blur-[2px] hover:blur-[1px] z-50`}
          onClick={() => {
            setFadeEffect(true);
            const audio = new Audio("/big_select.wav"); // Replace "tone.mp3" with the path to your audio file
            audio.play();
            const timer = setTimeout(() => {
              router.push("/area");
            }, 1200);
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
};

export default HomeButton;
