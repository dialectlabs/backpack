import type { DbNotification, EnrichedNotification } from "@coral-xyz/common";
import { BACKEND_API_URL, fetchXnftsFromPubkey } from "@coral-xyz/common";
import { atomFamily, selectorFamily } from "recoil";

import { anchorContext } from "./solana/wallet";

export const recentNotifications = selectorFamily<
  Array<EnrichedNotification>,
  {
    limit: number;
    offset: number;
  }
>({
  key: "recentNotifications",
  get:
    ({ limit, offset }: { limit: number; offset: number }) =>
    async ({ get }: any) => {
      try {
        const provider = get(anchorContext).provider;
        const notifications = (await fetchNotifications(offset, limit)) || [];
        const xnftIds = notifications.map((x) => x.xnft_id);
        const uniqueXnftIds = xnftIds.filter(
          (x, index) => xnftIds.indexOf(x) === index
        );
        const xnftMetadata = await fetchXnftsFromPubkey(
          provider,
          uniqueXnftIds
        );
        return notifications.map((notificaiton) => {
          const metadata = xnftMetadata.find(
            (x) => x.xnftId === notificaiton.xnft_id
          );
          return {
            ...notificaiton,
            xnftImage: metadata?.image || "",
            xnftTitle: metadata?.title || "",
            timestamp: new Date(notificaiton.timestamp).getTime(),
          };
        });
      } catch (e) {
        return [];
      }
    },
});

const fetchNotifications = (
  offset: number,
  limit: number
): Promise<DbNotification[]> => {
  return new Promise((resolve) => {
    fetch(`${BACKEND_API_URL}/notifications?limit=${limit}&offset=${offset}`, {
      method: "GET",
    })
      .then(async (response) => {
        const json = await response.json();
        resolve(json.notifications || []);
      })
      .catch((e) => resolve([]));
  });
};
