import { useEffect, useMemo } from "react";
import {
  useActiveSolanaWallet,
  useTransactionRequest,
} from "@coral-xyz/recoil";
import type { ConfigProps } from "@dialectlabs/react-sdk";
import type {
  DialectSolanaWalletAdapter,
  SolanaConfigProps} from "@dialectlabs/react-sdk-blockchain-solana";
import {
  DialectSolanaSdk
} from "@dialectlabs/react-sdk-blockchain-solana";
import { PublicKey } from "@solana/web3.js";
import base58 from "bs58";

import { NavTabs } from "../common/Layout/NavTabs";

export function Unlocked() {
  const [tx, setTx] = useTransactionRequest();
  const { publicKey } = useActiveSolanaWallet();

  const wallet: DialectSolanaWalletAdapter | null = useMemo(
    () => ({
      publicKey: new PublicKey(publicKey),
      signMessage: (message) => {
        return new Promise((resolve, reject) => {
          setTx({
            kind: "plugin-request-solana-sign-message",
            publicKey: publicKey,
            data: base58.encode(message),
            xnftAddress: PublicKey.default.toString(),
            resolve: (signature) => {
              resolve(base58.decode(signature));
            },
            reject: (error) => {
              reject(error);
            },
          });
        });
      },
      // signTransaction: (tx: any) => window.xnft.signTransaction(tx),
    }),
    [publicKey]
  );

  const dialectConfig: ConfigProps = useMemo(
    () => ({
      environment: "production",
    }),
    []
  );

  const solanaConfig: SolanaConfigProps = useMemo(
    () => ({
      wallet,
    }),
    [wallet]
  );

  return (
    <DialectSolanaSdk
      config={dialectConfig}
      solanaConfig={solanaConfig}
      autoConnect
    >
      <NavTabs />
    </DialectSolanaSdk>
  );
}
