import React, { useEffect, useRef, useState } from "react";
import type { SubscriptionType } from "@coral-xyz/common";
import { generateUniqueId } from "@coral-xyz/common";
import { useDialectSdk, useThreadMessages } from "@dialectlabs/react-sdk";

import type { ChatManager,EnrichedMessage  } from "../ChatManager";

import { ChatProvider } from "./ChatContext";
import { FullScreenChat } from "./FullScreenChat";

interface ChatRoomProps {
  roomId: string;
  userId: string;
  mode?: "fullscreen" | "minimized";
  type: SubscriptionType;
  username: string;
  areFriends?: boolean;
  requested?: boolean;
  remoteUserId?: string;
  blocked?: boolean;
  spam?: boolean;
  setRequested?: any;
  setSpam?: any;
  setBlocked?: any;
}

export const ChatRoom = ({
  roomId,
  userId,
  username,
  type = "collection",
  mode = "fullscreen",
  areFriends = true,
  requested = false,
  remoteUserId,
  blocked,
  spam,
  setRequested,
  setSpam,
  setBlocked,
  dialectThreadId = {},
}: any) => {
  const [chatManager, setChatManager] = useState<ChatManager | null>(null);
  // TODO: Make state propogte from outside the state since this'll be expensive
  const [chats, setChats] = useState<EnrichedMessage[]>([]);
  // const [loading, setLoading] = useState(true);

  const {
    messages,
    isFetchingMessages: loading,
    send,
  } = useThreadMessages({
    id: dialectThreadId,
    refreshInterval: 2000,
  });

  useEffect(() => {
    const enrichedMessages: EnrichedMessage[] = messages.map((msg) => {
      return {
        id: msg.timestamp.getTime(),
        created_at: msg.timestamp.toString(),
        direction: msg.author.address === remoteUserId ? "recv" : "send",
        username: "none",
        image: "",
        message_kind: "text",
        message: msg.text,
      };
    });
    enrichedMessages.sort((a, b) => a.id - b.id);
    setChats(enrichedMessages);
  }, [messages]);

  return (
    <ChatProvider
      loading={loading}
      chatManager={chatManager}
      roomId={roomId}
      chats={chats}
      setChats={setChats}
      userId={userId}
      username={username}
      areFriends={areFriends}
      requested={requested}
      remoteUserId={remoteUserId || ""}
      type={type}
      spam={spam}
      blocked={blocked}
      setRequested={setRequested}
      setSpam={setSpam}
      setBlocked={setBlocked}
    >
      <FullScreenChat
        dialectThreadId={dialectThreadId}
        onSend={(text) => {
          send({ text, deduplicationId: generateUniqueId() });
        }}
      />
    </ChatProvider>
  );
};
