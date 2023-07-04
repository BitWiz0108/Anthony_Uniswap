import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Wallet from "./wallet";
import logo from "../public/logo.svg";

export default function Layout({ title, children }) {
  
  return (
    <div className="h-screen w-screen">
      <Head>
        <title>{title ? title + " - " : ""}MayaDEX</title>
      </Head>
      <div className="video-background">
        <div>
            <video
              loop
              muted
              autoPlay
              playsInline
              className="w-full h-screen object-cover"
              src="/videos/KUBERED.mp4"
          />
          {/* <Image className="w-full h-full object-fit"
          width={5000}
          height={5000}
          src={"/images/swap_bg.jpg"} /> */}
        </div>
      </div>      
      <div className="header z-30">
        <div className="header-logo">
          <Image src={logo} alt="MayaDEX Logo" height={60} width={60} />
        </div>
        <div className="header-links">
          <Link href="/">Swap</Link>
          <Link href="/pool">Pool</Link>
        </div>
        <div className="header-wallet">
          <Wallet />
        </div>
      </div>

      {children}

      <div className="absolute bottom-12 footer w-full z-30">
        <a href="https://www.eldorado.market/" target="_blank" rel="noreferrer">
          Website
        </a>
        <a
          href="https://twitter.com/eldoradomrkt"
          target="_blank"
          rel="noreferrer"
        >
          Twitter
        </a>
        <a
          href="https://discord.gg/T7f7HYTDq6"
          target="_blank"
          rel="noreferrer"
        >
          Discord
        </a>
        <a
          href="https://el-dorado.gitbook.io/el-dorado/introduction-to-el-dorado/vision"
          target="_blank"
          rel="noreferrer"
        >
          GitBook
        </a>
      </div>
    </div>
  );
}
