import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";

import * as atoms from "../atoms";
import {
  useBackgroundClient,
  useConnectionBackgroundClient,
  useNavigationSegue,
  usePlugins,
} from "../hooks";

export function PluginManager(props: any) {
  const plugins = usePlugins();
  const segue = useNavigationSegue();
  const setTransactionRequest = useSetRecoilState(atoms.transactionRequest);
  const backgroundClient = useBackgroundClient();
  const connectionBackgroundClient = useConnectionBackgroundClient();

  //
  // Bootup all the plugins on the initial render.
  //
  useEffect(() => {
    plugins
      ?.filter((p) => p.needsLoad)
      .forEach((plugin) => {
        plugin.setHostApi({
          push: segue.push,
          pop: segue.pop,
          request: setTransactionRequest,
          backgroundClient,
          connectionBackgroundClient,
        });
      });
  }, [plugins]);

  return <>{props.children}</>;
}
