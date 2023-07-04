import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout";
import {
  apiRequest,
  getAssetName,
  formatNumber,
  formatDatetime,
  formatAddress,
  formatAddressLink,
  formatExplorerLink,
  DISPLAY_DECIMALS,
} from "../utils";

export default function Progress() {
  const [tx, setTx] = useState();
  const { query } = useRouter();

  async function fetchData() {
    if (tx) return;
    const { actions } = await apiRequest("/actions?address=" + query.from);
    for (let action of actions) {
      if (!action.in.length || !action.out.length) continue;
      if (!action.in[0].coins.length || !action.out[0].coins.length) continue;
      const coin = action.in[0].coins[0];
      if (coin.asset === "MAYA.CACAO") coin.amount = coin.amount.slice(0, -2);
      if (coin.asset !== query.in || coin.amount !== query.ina) continue;
      if (parseInt(action.date) / 1e6 < parseInt(query.start)) continue;
      if (action.status !== "success") continue;
      let outAmount = action.out[0].coins[0].amount;
      if (query.out === "MAYA.CACAO") outAmount = outAmount.slice(0, -2);
      setTx({
        status: action.type === "refund" ? "Refunded" : "Success",
        date: new Date(parseInt(action.date) / 1e6),
        hash: action.in[0].txID,
        outAddress: action.out[0].address,
        outAmount: outAmount,
        error: action.metadata?.refund?.reason,
      });
      return;
    }
  }

  useEffect(() => {
    if (!query.hash) return;
    fetchData();
    const handle = setInterval(fetchData, 10000);
    return () => clearInterval(handle);
  }, [query.hash]);

  return (
    <Layout> 
      <h1 className="title">Swap Tracker</h1>
      <div className="container">
        <div className="flex mb-2">
          <div className="flex-1 text-faded">Status</div>
          <div className="font-bold">{tx ? tx.status : "Pending"}</div>
        </div>

        <div className="flex mb-2">
          <div className="flex-1 text-faded">Swap</div>
          <div className="font-bold">
            {formatNumber(query.ina, DISPLAY_DECIMALS[query.in])}{" "}
            {getAssetName(query.in)} &rarr;{" "}
            {tx
              ? formatNumber(tx.outAmount, DISPLAY_DECIMALS[query.out])
              : "~" +
                formatNumber(query.outa, DISPLAY_DECIMALS[query.out])}{" "}
            {getAssetName(query.out)}
          </div>
        </div>

        <div className="flex mb-2">
          <div className="flex-1 text-faded">In Address</div>
          <div className="font-bold">
            <a
              href={formatAddressLink(query.from, query.in)}
              target="_blank"
              rel="noreferrer"
            >
              {formatAddress(query.from)}
            </a>
          </div>
        </div>

        <div className="flex mb-2">
          <div className="flex-1 text-faded">In Hash</div>
          <div className="font-bold">
            <a
              href={formatExplorerLink(query.hash, query.in)}
              target="_blank"
              rel="noreferrer"
            >
              {formatAddress(query.hash || "")}
            </a>
          </div>
        </div>

        <div className="flex mb-2">
          <div className="flex-1 text-faded">In Time</div>
          <div className="font-bold">
            {formatDatetime(parseInt(query.start))}
          </div>
        </div>

        {tx ? (
          <>
            <div className="flex mb-2">
              <div className="flex-1 text-faded">Out Address</div>
              <div className="font-bold">
                <a
                  href={formatAddressLink(tx.outAddress, query.out)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {formatAddress(tx.outAddress)}
                </a>
              </div>
            </div>
            <div className="flex mb-2">
              <div className="flex-1 text-faded">Out Hash</div>
              <div className="font-bold">
                <a
                  href={formatExplorerLink(tx.hash, "MAYA")}
                  target="_blank"
                  rel="noreferrer"
                >
                  {formatAddress(tx.hash || "")}
                </a>
              </div>
            </div>
            <div className="flex mb-2">
              <div className="flex-1 text-faded">Out Time</div>
              <div className="font-bold">{formatDatetime(tx.date)}</div>
            </div>
          </>
        ) : null}

        {tx && tx.error ? (
          <div className="alert">Swap got refunded: {tx.error}</div>
        ) : null}
      </div>
    </Layout>
  );
}
