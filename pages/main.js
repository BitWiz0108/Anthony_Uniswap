import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Icon from "../components/icon";
import Switch from "../components/switch";
import Layout from "../components/layout";
import {
  nativeAsset,
  formatNumber,
  tokenIcons,
  apiRequest,
  nodeRequest,
  dummyDestinations,
  getAssetChain,
  getAssetName,
  useAtom,
  getAtom,
  walletsAtom,
  fetchPools,
  walletSwap,
  DISPLAY_DECIMALS,
  CLIENTS,
  CHAINS_NATIVE_ASSET,
} from "../utils";

export default function Swap() {
  const router = useRouter();
  const [wallets] = useAtom(walletsAtom);
  const [modal, setModal] = useState();
  const [pools, setPools] = useState();
  const [poolIn, setPoolIn] = useState();
  const [poolOut, setPoolOut] = useState();
  const [amount, setAmount] = useState("");
  const [balances, setBalances] = useState({});
  const [quote, setQuote] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSimpleView, setIsSimpleView] = useState(false);
  const [isMenuToggle, setIsMenuToggle] = useState(false);

  const [isAreaClicked, setIsAreaClicked] = useState(false);
  const [isHoveredMenu, setIsHoveredMenu] = useState(-1);
  const [description, setDescription] = useState("UNISWAP");

  const areaMenus = [
    "Trade",
    "Deposit",
    "Learn/Borrow",
    "Send",
    "Learn",
    "Onramp",
    "Prime",
  ];

  const hoverAreaMenus = [
    "Trade",
    "Deposit",
    "Learn/Borrow",
    "Send",
    "Learn",
    "Onramp",
    "Sub",
  ];

  const subMenus = [
    ["Swap", "Perp"],
    ["Add", "Withdraw", "Statistics", "Savers"],
    ["Coming Soon"],
    [],
    ["Gitbook", "Maya Gitbook", "LPU"],
    ["OnRamp"],
    [],
  ];

  const targetAddr = ["main", "wallet", "stats", "add", "withdraw", "savers"];

  const assetPrices = {};
  if (pools) pools.forEach((p) => (assetPrices[p.asset] = p.price));

  let valueIn = 0;
  let amountOut = 0;
  let valueOut = 0;
  try {
    valueIn = parseFloat(amount) * poolIn?.price;
    if (Number.isNaN(valueIn)) valueIn = 0;
    if (quote) {
      amountOut = quote.out;
      valueOut = amountOut * poolOut.price;
    }
  } catch (e) {
    console.error("calc", e);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalVisible(true);
    }, 1000);
  }, []);

  useEffect(() => {
    (async () => {
      if (!poolIn || !poolOut) return;
      router.replace(
        `main/?in=${poolIn.asset}&out=${poolOut.asset}&amount=${amount}`
      );
      if (isNaN(parseFloat(amount))) return setQuote();
      const amountF = parseFloat(amount);
      const amountStr = (
        amountF * (poolIn.asset === "MAYA.CACAO" ? 1e10 : 1e8)
      ).toFixed(0);
      const outChain = getAssetChain(poolOut.asset);
      const outWallet = wallets.find((w) => w.chain === outChain);
      const destination = outWallet?.address || dummyDestinations[outChain];
      const quote = await nodeRequest(
        `/quote/swap?from_asset=${poolIn.asset}&to_asset=${poolOut.asset}&amount=${amountStr}&destination=${destination}`
      );
      if (quote.error) {
        setQuote({
          error: quote.error,
          out: 0,
          feeAsset: "MAYA.CACAO",
          feeSlip: 0,
          feeAffiliate: 0,
          feeOutbound: 0,
        });
        return;
      }
      const out =
        parseInt(quote.expected_amount_out) /
        (poolOut.asset === "MAYA.CACAO" ? 1e10 : 1e8);
      let inputBalance = poolIn.balanceAsset;
      if (poolIn.asset === nativeAsset) inputBalance = poolOut.balanceNative;
      setQuote({
        out: out,
        feeAsset: quote.fees.asset,
        feeSlip: (amountF / (amountF + inputBalance)) * amountF,
        feeAffiliate:
          parseInt(quote.fees.affiliate) /
          (quote.fees.asset === "MAYA.CACAO" ? 1e10 : 1e8),
        feeOutbound:
          parseInt(quote.fees.outbound) /
          (quote.fees.asset === "MAYA.CACAO" ? 1e10 : 1e8),
      });
    })();
  }, [poolIn, poolOut, amount]);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.amount) setAmount(router.query.amount);

    (async () => {
      let pools = await fetchPools();
      for (let pool of [...pools]) {
        if (pool.asset === nativeAsset) continue;
        pools = pools.concat([
          {
            ...pool,
            asset: pool.asset.replace(".", "/"),
          },
        ]);
      }
      setPoolIn(
        router.query.in
          ? pools.find((p) => p.asset === router.query.in)
          : pools[0]
      );
      setPoolOut(
        router.query.out
          ? pools.find((p) => p.asset === router.query.out)
          : pools.find((p) => p.asset === nativeAsset)
      );
      setPools(pools);
    })();
  }, [router.isReady]);

  useEffect(() => {
    for (let w of wallets) {
      CLIENTS[w.chain].balances(w.address, pools).then((b) =>
        b.forEach((b) => {
          setBalances((bs) => ({
            ...bs,
            [b.asset]: b.balance,
          }));
        })
      );
    }
  }, [wallets]);

  async function onSubmit() {
    try {
      setLoading(true);
      if (!poolIn || !poolOut) {
        throw new Error("Select a from and to asset first");
      }
      await walletSwap({
        wallets,
        amount,
        assetIn: poolIn.asset,
        assetOut: poolOut.asset,
        minAmountOut: amountOut * 0.99,
      });
    } catch (e) {
      setLoading(false);
      console.error(e);
      alert(e.message);
    }
  }

  function onSelect(p) {
    if (modal.target == "in") {
      setPoolIn(p);
      if (poolOut.asset == p.asset) {
        if (p.asset == nativeAsset) {
          setPoolOut(pools[0]);
        } else {
          setPoolOut(pools.find((p) => p.asset == nativeAsset));
        }
      }
    } else if (modal.target == "out") {
      setPoolOut(p);
      if (poolIn.asset == p.asset) {
        if (p.asset == nativeAsset) {
          setPoolIn(pools[0]);
        } else {
          setPoolIn(pools.find((p) => p.asset == nativeAsset));
        }
      }
    }
    setModal();
  }
  function onSwapDirection() {
    setPoolIn(poolOut);
    setPoolOut(poolIn);
  }
  if (!pools || !poolIn || !poolOut) {
    return (
      <Layout title="Swap">
        {" "}
        <div className="container">
          {" "}
          <div
            style={{
              padding: 60,
              textAlign: "center",
            }}
          >
            Loading...
          </div>{" "}
        </div>{" "}
      </Layout>
    );
  }

  return (
    <Layout title="Swap">
      <div className="absolute hidden md:flex justify-start items-start top-24 left-4 md:top-12 md:left-32 z-50">
        <Switch
          checked={isSimpleView}
          setChecked={setIsSimpleView}
          label="Switch to Simple Interface "
          labelPos="right"
        />
      </div>

      {/* <div className="absolute flex md:hidden justify-start items-start top-24 left-4 md:top-12 md:left-32 z-50">
        <Switch
          checked={isMenuToggle}
          setChecked={setIsMenuToggle}
          label="Toggle"
          labelPos="right"
        />
      </div> */}

      {!isSimpleView ? (
        <div className="container-fluide absolute left-0 top-0 w-full h-screen">
          <div
            className={`row ${
              isAreaClicked
                ? `opacity-0 transition-opacity duration-1000 ease-in-out`
                : ""
            }`}
          >
            <div className="col-half pt-40 hidden md:block">
              <div className="menu-area mobile w-72">
                <ul className=" w-max-[470px] text-right">
                  {areaMenus.map((areaMenu, index) => {
                    return (
                      <li className="animate__animated animate__fadeInLeft cursor-pointer bg-transparent after:w-[100%] md:after:w-[110%]" key={index}>
                        <a
                          onMouseEnter={() => {
                            setDescription(targetAddr[index]);
                            setIsHoveredMenu(index);
                          }}
                          onMouseLeave={()=>{
                            setIsHoveredMenu(-1);
                          }}
                          onClick={() => {
                            const timer = setTimeout(() => {
                              const url = targetAddr[index];
                              console.log("URL: ", url);
                              router.push(url);
                            }, 1200);
                          }}
                        >
                          {isHoveredMenu == index ?  hoverAreaMenus[index] : areaMenu}
                        </a>
                        <ul class="sub-menu">
                          {subMenus[index].length > 0
                            ? subMenus[index].map((subMenu, subindex) => {
                                console.log(subMenu);
                                return (
                                  <li class="link_animate" key={index}>
                                    <span class="hide">{subMenu}</span>
                                    <a href={subMenu}>{subMenu}</a>
                                  </li>
                                );
                              })
                            : ""}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="absolute left-0 top-0 w-full h-full bg-transparent hidden md:block z-20">
              <Image
                className="absolute w-24 h-full object-stretch"
                src="/images/link-image.png"
                width={125}
                height={600}
                alt=""
              />
            </div>

            <div className=" absolute col-half right-[10%] bottom-[15%] hidden md:block z-20">
              <div className="content-area">
                <h2 id="title" className="text-sm">{description}</h2>
                <h3 id="sub-title"></h3>
                <p className="information">Uniswap</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      <div className="relative z-30 px-10 md:px-2 overflow-y-auto">
        <div
          className={`container ${
            isModalVisible ? "opacity-100" : "opacity-0"
          } transition-opacity duration-1000 ease-in-out`}
        >
          {quote && quote.error ? (
            <div className="alert mb-4">{quote.error}</div>
          ) : null}

          <div style={{ position: "relative" }}>
            <div className="swap-swap-direction" onClick={onSwapDirection}>
              <Icon name="arrow-down" />
            </div>

            <div className="section swap-side">
              <div className="swap-amount">
                <input
                  className="swap-amount-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
                <div className="swap-amount-value">
                  $ {formatNumber(valueIn)}
                </div>
              </div>
              <div className="swap-token">
                <div
                  className="swap-token-input"
                  onClick={() =>
                    setModal({ type: "selectToken", target: "in" })
                  }
                >
                  <div className="swap-token-input-icon">
                    {tokenIcons[poolIn.asset.replace("/", ".")] ? (
                      <img src={tokenIcons[poolIn.asset.replace("/", ".")]} />
                    ) : (
                      <div className="swap-token-input-icon-unknown">
                        {getAssetName(poolIn.asset)[0]}
                      </div>
                    )}
                  </div>
                  <div className="swap-token-input-name">
                    {getAssetName(poolIn.asset)}
                  </div>
                  <div className="swap-token-input-chevron">
                    <Icon name="chevronDown" />
                  </div>
                </div>
                <div className="swap-amount-value text-right">
                  Balance:{" "}
                  {formatNumber(
                    balances[poolIn.asset] || 0,
                    DISPLAY_DECIMALS[poolIn.asset]
                  )}
                </div>
              </div>
            </div>

            <div className="section swap-side">
              <div className="swap-amount">
                <input
                  className="swap-amount-input"
                  value={
                    amountOut > 0
                      ? formatNumber(
                          amountOut,
                          DISPLAY_DECIMALS[poolOut?.asset]
                        )
                      : ""
                  }
                  readOnly
                  placeholder="0"
                />
                <div className="swap-amount-value">
                  $ {formatNumber(valueOut)}
                </div>
              </div>
              <div className="swap-token">
                <div
                  className="swap-token-input"
                  onClick={() =>
                    setModal({ type: "selectToken", target: "out" })
                  }
                >
                  <div className="swap-token-input-icon">
                    {tokenIcons[poolOut.asset.replace("/", ".")] ? (
                      <img src={tokenIcons[poolOut.asset.replace("/", ".")]} />
                    ) : (
                      <div className="swap-token-input-icon-unknown">
                        {getAssetName(poolOut.asset)[0]}
                      </div>
                    )}
                  </div>
                  <div className="swap-token-input-name">
                    {getAssetName(poolOut.asset)}
                  </div>
                  <div className="swap-token-input-chevron">
                    <Icon name="chevronDown" />
                  </div>
                </div>
                <div className="swap-amount-value text-right">
                  Balance:{" "}
                  {formatNumber(
                    balances[poolOut.asset] || 0,
                    DISPLAY_DECIMALS[poolOut.asset]
                  )}
                </div>
              </div>
            </div>
          </div>

          {quote ? (
            <>
              <div className="flex mb-2">
                <div className="flex-1 text-faded">Slippage Fee</div>
                <div>
                  ($
                  {formatNumber(
                    quote.feeSlip * assetPrices[poolIn.asset]
                  )}){" "}
                  {formatNumber(quote.feeSlip, DISPLAY_DECIMALS[poolIn.asset])}{" "}
                  {getAssetName(poolIn.asset)}
                </div>
              </div>
              <div className="flex mb-4">
                <div className="flex-1 text-faded">Outbound Fee</div>
                <div>
                  ($
                  {formatNumber(
                    quote.feeOutbound * assetPrices[quote.feeAsset]
                  )}
                  ){" "}
                  {formatNumber(
                    quote.feeOutbound,
                    DISPLAY_DECIMALS[quote.feeAsset]
                  )}{" "}
                  {getAssetName(quote.feeAsset)}
                </div>
              </div>
            </>
          ) : null}

          <button
            className="button button-large"
            style={{ width: "100%", opacity: loading ? "0.6" : "1" }}
            disabled={loading}
            onClick={onSubmit}
          >
            {loading ? "Signing & sending..." : "Swap"}
          </button>
        </div>

        {modal && modal.type == "selectToken" ? (
          <div className="modal z-50" onClick={() => setModal()}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h1 className="modal-title">Select a token</h1>
              {pools.map((p) => (
                <div className="pool pool-modal" key={p.asset}>
                  <div
                    className={`pool-icon ${
                      p.asset.includes("/") ? "pool-icon-synth" : ""
                    }`}
                  >
                    {tokenIcons[p.asset.replace("/", ".")] ? (
                      <img src={tokenIcons[p.asset.replace("/", ".")]} />
                    ) : (
                      <div className="pool-icon-unknown">
                        {getAssetName(p.asset)[0]}
                      </div>
                    )}
                  </div>
                  <div className="pool-name">{getAssetName(p.asset)}</div>
                  <div className="text-right">
                    <a className="button" onClick={onSelect.bind(null, p)}>
                      Select
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
