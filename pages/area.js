import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Area() {
  const router = useRouter();

  const [isAreaClicked, setIsAreaClicked] = useState(false);
  const [description, setDescription] = useState("UNISWAP");

  const areaMenus = [
    "AREA1",
    "AREA2",
    "AREA3",
    "AREA4",
    "AREA5",
    "DATE FLIES",
    "REPLAY",
    "OPTION",
  ];

  const targetAddr = ["main", "wallet", "stats", "add", "withdraw", "savers"];

  // useEffect(() => {alert(description)}, [description]);

  return (
    <div className="w-full h-screen bg-gray-500">
      <div className="center">
        <div className="container-fluide">
          <div
            className={`row ${
              isAreaClicked
                ? `opacity-0 transition-opacity duration-1000 ease-in-out`
                : ""
            }`}
          >
            <div className="col-half pt-40">
              <div className="menu-area mobile w-72">
                <ul>
                  {areaMenus.map((areaMenu, index) => {
                    return (
                      <li className="animate__animated animate__fadeInLeft cursor-pointer bg-transparent" key={index}>
                        <a
                          onMouseEnter={() => {
                            setDescription(targetAddr[index]);
                          }}
                          onClick={() => {
                            const timer = setTimeout(() => {
                              const url = targetAddr[index];
                              console.log("URL:  ", url);
                              router.push(url);
                            }, 1200);
                          }}
                        >
                          {areaMenu}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="absolute left-0 top-0 w-full h-full bg-gray-500">
              <Image
                className="absolute w-24 h-full object-stretch"
                src="/images/link-image.png"
                width={125}
                height={600}
                alt=""
              />
            </div>

            <div className=" relative col-half bottom-40 z-50">
              <div className="content-area">
                <h2 id="title">{description}</h2>
                <h3 id="sub-title"></h3>
                <p className="information">Uniswap</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
