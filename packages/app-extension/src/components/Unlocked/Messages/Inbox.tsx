import { useEffect, useState } from "react";
import type { EnrichedInboxDb } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  NAV_COMPONENT_MESSAGE_PROFILE,
  NAV_COMPONENT_MESSAGE_REQUESTS,
} from "@coral-xyz/common";
import { useNavigation } from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import {
  useDialectSdk,
  useDialectWallet,
  useThreads,
} from "@dialectlabs/react-sdk";
import AddIcon from "@mui/icons-material/Add";

import { TextInput } from "../../common/Inputs";

import { MessageList } from "./MessageList";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { NewMessageModal } from "./NewMessageModal";
import { useStyles } from "./styles";

function shortenAddress(address: string, chars = 4): string {
  const addr = address.toString();
  return `${addr.substring(0, chars)}...${addr.substring(addr.length - chars)}`;
}

export function Inbox() {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  const [activeChats, setActiveChats] = useState<EnrichedInboxDb[]>([]);
  const [newSettingsModal, setNewSettingsModal] = useState(false);
  const { push } = useNavigation();

  const { threads: dialectThreads, isFetchingThreads } = useThreads({
    refreshInterval: 10000,
  });

  useEffect(() => {
    const eids: EnrichedInboxDb[] = dialectThreads.map((t) => {
      const otherMember = t.otherMembers[0];
      return {
        dialectThreadId: t.id,
        remoteUserId: otherMember.address,
        are_friends: false,
        remoteUserImage:
          "https://dialect-file-storage.s3.us-west-2.amazonaws.com/dapp-avatars/dialect.png",
        remoteUsername: shortenAddress(otherMember.address),
        user1: "user1",
        user2: "user2",
        last_message_sender: t.lastMessage?.author.address,
        last_message_timestamp: t.lastMessage?.timestamp.toString(),
        last_message: t.lastMessage?.text,
      };
    });
    setActiveChats(eids);
  }, [dialectThreads]);

  return (
    <div className={classes.container}>
      <TextInput
        className={classes.searchField}
        placeholder={"Search"}
        value={searchFilter}
        setValue={async (e) => {
          const prefix = e.target.value;
          setSearchFilter(prefix);
        }}
        inputProps={{
          style: {
            height: "48px",
          },
        }}
      />
      <div
        style={{
          display: "flex",
          marginBottom: 10,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex" }}>
          <div className={classes.text}>Threads</div>{" "}
          {/* <div
            className={classes.roundBtn}
            onClick={() => setNewSettingsModal(true)}
          >
            {" "}
            <AddIcon className={classes.add} />{" "}
          </div> */}
        </div>
        {/* <div>
          <div
            className={classes.text}
            style={{ cursor: "pointer" }}
            onClick={() => {
              push({
                title: `Requests`,
                componentId: NAV_COMPONENT_MESSAGE_REQUESTS,
                componentProps: {},
              });
            }}
          >
            View Requests
          </div>
        </div> */}
      </div>
      {isFetchingThreads && <MessagesSkeleton />}
      {!isFetchingThreads && (
        <MessageList
          activeChats={activeChats.filter((x) =>
            x.remoteUsername.includes(searchFilter)
          )}
        />
      )}
      <NewMessageModal
        newSettingsModal={newSettingsModal}
        setNewSettingsModal={setNewSettingsModal}
      />
    </div>
  );
}
