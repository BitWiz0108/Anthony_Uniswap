import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../components/layout";
import { formatNumber, fetchPools, tokenIcons, nativeAsset } from "../utils";

export default function Pool() {
  const [pools, setPools] = useState();

  useEffect(() => {
    (async () => {
      setPools(await fetchPools());
    })();
  }, []);

  function onSubmit() {}

  const assetPrices = {};
  if (pools) pools.forEach((p) => (assetPrices[p.asset] = p.price));
  const cacaoUsd = assetPrices[nativeAsset] || 0;
  const cacaoRune = cacaoUsd / (assetPrices["THOR.RUNE"] || 0);
  const cacaoBtc = cacaoUsd / (assetPrices["BTC.BTC"] || 0);
  const tvl = pools?.reduce((t, p) => t + (p.tvl || 0), 0) || 0;

  return (
    <Layout title="Swap">
      <div className="container container-wide flex">
        <div className="number flex-1">
          <div className="number-value">{formatNumber(tvl)}</div>
          <div className="number-label">TVL</div>
        </div>
        <div className="number flex-1">
          <div className="number-value">{formatNumber(cacaoUsd, 3)}</div>
          <div className="number-label">USD/CACAO</div>
        </div>
        <div className="number flex-1">
          <div className="number-value">{formatNumber(cacaoRune, 3)}</div>
          <div className="number-label">RUNE/CACAO</div>
        </div>
        <div className="number flex-1">
          <div className="number-value">{formatNumber(cacaoBtc, 6)}</div>
          <div className="number-label">BTC/CACAO</div>
        </div>
      </div>
      <div className="container container-wide">
        <div className="pool pool-header">
          <div></div>
          <div>Pool</div>
          <div className="text-right">Price</div>
          <div className="text-right">Liquidity</div>
          <div className="text-right">Volume 24h</div>
          <div className="text-right">APR</div>
          <div className="hidden-phone"></div>
        </div>
        {!pools ? (
          <div style={{ padding: 60, textAlign: "center" }}>Loading...</div>
        ) : (
          pools
            .filter((p) => p.asset !== nativeAsset)
            .map((p) => (
              <div className="pool" key={p.asset}>
                <div className="pool-icon">
                  {tokenIcons[p.asset] ? (
                    <img src={tokenIcons[p.asset]} />
                  ) : (
                    <div className="pool-icon-unknown">
                      {p.asset.split(".")[1][0]}
                    </div>
                  )}
                </div>
                <div className="pool-name">
                  {p.asset.split(".")[1].split("-")[0]}
                </div>
                <div className="text-right">{formatNumber(p.price)}</div>
                <div className="text-right">{formatNumber(p.tvl)}</div>
                <div className="text-right">{formatNumber(p.volume, 2)}</div>
                <div className="text-right">{formatNumber(p.apr * 100)}%</div>
                <div className="text-right hidden-phone">
                  <a
                    onClick={() => {
                      alert("Coming soon!");
                    }}
                  >
                    <span className="button">Add Liquidity</span>
                  </a>
                </div>
              </div>
            ))
        )}
      </div>
    </Layout>
  );
}
