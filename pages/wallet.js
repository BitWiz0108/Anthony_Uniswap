import { useEffect, useState } from "react";
import Layout from "../components/layout";
import {
  useAtom,
  walletsAtom,
  apiRequest,
  fetchPools,
  getAssetName,
  formatNumber,
  formatDatetime,
  formatAddress,
  formatAddressLink,
  formatExplorerLink,
  nativeAsset,
  CLIENTS,
  DISPLAY_DECIMALS,
  CHAINS_NAMES,
  CHAINS_NATIVE_ASSET,
} from "../utils";

export default function Wallet() {
  const [modal, setModal] = useState();
  const [wallets] = useAtom(walletsAtom);
  const [balances, setBalances] = useState({});
  const [lps, setLps] = useState({});
  const [pools, setPools] = useState([]);
  const sortedLps = Object.values(lps).sort((a, b) => b.created - a.created);
  const assetPrices = {};
  if (pools) pools.forEach((p) => (assetPrices[p.asset] = p.price));

  function onTransfer(wallet, balance) {
    setModal({ type: "transfer", wallet, balance, to: "", amount: "" });
  }

  async function onTransferSubmit(e) {
    try {
      e.preventDefault();
      setModal({ ...modal, isLoading: true });
      let txHash;
      if (assetPrices[modal.balance.asset] && modal.isDeposit) {
        txHash = await modal.wallet.deposit({
          amount: modal.amount,
          memo: modal.to,
          asset: modal.balance.asset,
        });
      } else {
        txHash = await modal.wallet.transfer({
          to: modal.to,
          amount: modal.amount,
          asset: modal.balance.asset,
        });
      }
      console.log("transfer", txHash);
      //window.location.href = formatExplorerLink(txHash, modal.balance.asset);
      window.open(formatExplorerLink(txHash, modal.balance.asset), "_blank")
      setModal();
    } catch (e) {
      console.error("transfer", e);
      setModal({ ...modal, isLoading: false, error: e.message });
    }
  }

  useEffect(() => {
    (async () => {
      const pools = await fetchPools();
      setPools(pools);
      for (let w of wallets) {
        CLIENTS[w.chain].balances(w.address, pools).then((b) => {
          setBalances((bs) => ({ ...bs, [w.chain]: b }));
        });

        apiRequest("/member/" + w.address).then(
          ({ pools: lps }) => {
            for (let lp of lps) {
              const pool = pools.find((p) => p.asset === lp.pool);
              const units = parseInt(lp.liquidityUnits);
              const assetRedeemable = (pool.balanceAsset * units) / pool.units;
              const nativeRedeemable =
                (pool.balanceNative * units) / pool.units;
              setLps((lps) => ({
                ...lps,
                [lp.asset + lp.assetAddress + lp.nativeAddress]: {
                  asset: lp.pool,
                  created: new Date(parseInt(lp.dateFirstAdded) * 1000),
                  units: parseInt(lp.liquidityUnits),
                  assetAddress: lp.assetAddress,
                  assetAdded: parseInt(lp.assetAdded) / 1e8,
                  assetPending: parseInt(lp.assetPending) / 1e8,
                  assetWithdrawn: parseInt(lp.assetWithdrawn) / 1e8,
                  nativeAddress: lp.runeAddress,
                  nativeAdded: parseInt(lp.runeAdded) / 1e10,
                  nativePending: parseInt(lp.runePending) / 1e10,
                  nativeWithdrawn: parseInt(lp.runeWithdrawn) / 1e10,
                  assetRedeemable,
                  nativeRedeemable,
                },
              }));
            }
          },
          () => {}
        );
      }
    })();
  }, [wallets]);

  return (
    <Layout>
      <h1 className="title">Wallet</h1>
      <div className="container" style={{ maxWidth: 600 }}>
        {wallets.map((w) => {
          return (
            <div className="mb-4" key={w.address}>
              <div className="flex mb-2">
                <div className="flex-1 font-bold">{CHAINS_NAMES[w.chain]}</div>
                <div>
                  <a
                    href={formatAddressLink(w.address, w.chain)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {formatAddress(w.address)}
                  </a>
                </div>
              </div>
              <table className="table-no-border">
                {(balances[w.chain] || []).map((b) => (
                  <tr key={b.asset}>
                    <td>{getAssetName(b.asset)}</td>
                    <td className="text-right" style={{ width: "33%" }}>
                      ${" "}
                      {formatNumber(
                        b.balance *
                          (pools.find((p) =>
                            p.asset.startsWith(b.asset.replace("/", "."))
                          )?.price || 0)
                      )}
                    </td>
                    <td
                      className="text-right font-bold"
                      style={{ width: "33%" }}
                    >
                      {formatNumber(b.balance, DISPLAY_DECIMALS[b.asset])}
                    </td>
                    <td className="text-right" style={{ width: 90 }}>
                      <button
                        className="button button-small"
                        onClick={onTransfer.bind(null, w, b)}
                      >
                        Transfer
                      </button>
                    </td>
                  </tr>
                ))}
              </table>
            </div>
          );
        })}
        {wallets.length === 0 ? (
          <div className="text-center py-8">No wallet connected</div>
        ) : null}
      </div>

      {sortedLps.length > 0 ? <h1 className="title">LP Positions</h1> : null}
      {sortedLps.map((lp) => (
        <div className="container" key={lp.asset}>
          <div className="flex mb-2">
            <div className="flex-1 font-bold">
              {lp.asset}{" "}
              {lp.assetPending > 0 || lp.nativePending > 0 ? "Pending" : ""}
            </div>
            <div>{formatDatetime(lp.created)}</div>
          </div>
          <div className="number text-center mb-2">
            <div className="number-value">
              {formatNumber(
                lp.nativeRedeemable * (assetPrices[nativeAsset] || 0) +
                  lp.assetRedeemable * (assetPrices[lp.asset] || 0)
              )}
            </div>
            <div className="number-label">Current USD Value</div>
          </div>
          <div className="flex mb-2">
            <div className="flex-1 text-faded">Asset Added</div>
            <div className="">
              (${formatNumber(lp.assetAdded * (assetPrices[lp.asset] || 0))}){" "}
              <b>{formatNumber(lp.assetAdded, DISPLAY_DECIMALS[lp.asset])}</b>
            </div>
          </div>
          <div className="flex mb-2">
            <div className="flex-1 text-faded">Cacao Added</div>
            <div className="">
              ($
              {formatNumber(
                lp.nativeAdded * (assetPrices[nativeAsset] || 0)
              )}) <b>{formatNumber(lp.nativeAdded)}</b>
            </div>
          </div>
          <div className="flex mb-2">
            <div className="flex-1 text-faded">Asset Removed</div>
            <div className="">
              (${formatNumber(lp.assetWithdrawn * (assetPrices[lp.asset] || 0))}
              ){" "}
              <b>
                {formatNumber(lp.assetWithdrawn, DISPLAY_DECIMALS[lp.asset])}
              </b>
            </div>
          </div>
          <div className="flex mb-2">
            <div className="flex-1 text-faded">Cacao Removed</div>
            <div className="">
              ($
              {formatNumber(
                lp.nativeWithdrawn * (assetPrices[nativeAsset] || 0)
              )}
              ) <b>{formatNumber(lp.nativeWithdrawn)}</b>
            </div>
          </div>
          <div className="flex mb-2">
            <div className="flex-1 text-faded">Asset Redeemable</div>
            <div className="">
              ($
              {formatNumber(
                lp.assetRedeemable * (assetPrices[lp.asset] || 0)
              )}){" "}
              <b>
                {formatNumber(lp.assetRedeemable, DISPLAY_DECIMALS[lp.asset])}
              </b>
            </div>
          </div>
          <div className="flex mb-2">
            <div className="flex-1 text-faded">Cacao Redeemable</div>
            <div className="">
              ($
              {formatNumber(
                lp.nativeRedeemable * (assetPrices[nativeAsset] || 0)
              )}
              ) <b>{formatNumber(lp.nativeRedeemable)}</b>
            </div>
          </div>
        </div>
      ))}

      {modal && modal.type == "transfer" ? (
        <div className="modal" onClick={() => setModal()}>
          <form
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            onSubmit={onTransferSubmit}
          >
            <h1 className="modal-title">
              Transfer {getAssetName(modal.balance.asset)}
            </h1>
            {modal.error ? (
              <div className="alert mb-4">{modal.error}</div>
            ) : null}
            {assetPrices[modal.balance.asset] ? (
              <label className="label mb-4">
                <input
                  type="checkbox"
                  checked={modal.isDeposit}
                  onChange={(e) =>
                    setModal({ ...modal, isDeposit: e.target.checked })
                  }
                />{" "}
                Make a deposit with custom memo
              </label>
            ) : null}
            <input
              autoFocus
              className="input mb-4"
              placeholder={
                modal.isDeposit
                  ? "Memo (e.g. -:BTC.BTC:5000)"
                  : "Recipient address (e.g. maya123...)"
              }
              value={modal.to}
              onChange={(e) => setModal({ ...modal, to: e.target.value })}
            />
            <input
              className="input mb-4"
              placeholder="Amount (e.g. 17.5)"
              value={modal.amount}
              onChange={(e) => setModal({ ...modal, amount: e.target.value })}
            />
            <button
              type="submit"
              className="button w-full"
              disabled={modal.isLoading}
            >
              {modal.isLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      ) : null}
    </Layout>
  );
}
