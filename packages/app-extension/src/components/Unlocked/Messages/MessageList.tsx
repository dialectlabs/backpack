import { useState } from "react";
import type { EnrichedInboxDb } from "@coral-xyz/common";
import {
  NAV_COMPONENT_MESSAGE_CHAT,
  NAV_COMPONENT_MESSAGE_PROFILE,
  NAV_COMPONENT_MESSAGE_REQUESTS,
} from "@coral-xyz/common";
import { useNavigation } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import MarkUnreadChatAltIcon from "@mui/icons-material/MarkUnreadChatAlt";
import { List, ListItem } from "@mui/material";

import { isFirstLastListItemStyle } from "../../common";
import { ProxyImage } from "../../common/ProxyImage";

import { useStyles } from "./styles";
export const MessageList = ({
  activeChats,
  requestCount = 0,
}: {
  activeChats: EnrichedInboxDb[];
  requestCount?: number;
}) => {
  const theme = useCustomTheme();

  return (
    <>
      <List
        style={{
          paddingTop: 0,
          paddingBottom: 0,
          borderRadius: "14px",
          border: `${theme.custom.colors.borderFull}`,
        }}
      >
        {requestCount > 0 && (
          <RequestsChatItem
            requestCount={requestCount}
            isFirst={true}
            isLast={activeChats.length === 0}
          />
        )}
        {activeChats.map((activeChat, index) => (
          <ChatListItem
            image={activeChat.remoteUserImage}
            username={activeChat.remoteUsername}
            userId={activeChat.remoteUserId}
            message={activeChat.last_message}
            timestamp={activeChat.last_message_timestamp}
            isFirst={requestCount === 0 && index === 0}
            isLast={index === activeChats.length - 1}
          />
        ))}
      </List>
    </>
  );
};

export function ChatListItem({
  image,
  username,
  message,
  timestamp,
  isFirst,
  isLast,
  userId,
}: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { push } = useNavigation();

  function formatAMPM(date: Date) {
    let hours = date.getHours();
    let minutes: string | number = date.getMinutes();
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return hours + ":" + minutes + " " + ampm;
  }

  return (
    <ListItem
      button
      disableRipple
      onClick={() => {
        push({
          title: `@${username}`,
          componentId: NAV_COMPONENT_MESSAGE_CHAT,
          componentProps: {
            userId,
            username,
          },
        });
      }}
      style={{
        padding: "10px",
        paddingLeft: "16px",
        paddingRight: "16px",
        display: "flex",
        height: "80px",
        backgroundColor: theme.custom.colors.nav,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{ flex: 1, display: "flex", justifyContent: "space-between" }}
        >
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <UserIcon
                onClick={() => {
                  push({
                    title: `@${username}`,
                    componentId: NAV_COMPONENT_MESSAGE_PROFILE,
                    componentProps: {
                      userId,
                    },
                  });
                }}
                image={image}
              />
            </div>
            <div>
              <div className={classes.userTextSmall}>@{username}</div>
              <div className={classes.userTextSmall}>
                {message?.substr(0, 50) || ""}
              </div>
            </div>
          </div>
          <div className={classes.timestamp}>
            {formatAMPM(new Date(timestamp))}
          </div>
        </div>
      </div>
    </ListItem>
  );
}

export function RequestsChatItem({
  requestCount,
  isFirst,
  isLast,
}: {
  requestCount: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { push } = useNavigation();

  return (
    <ListItem
      button
      disableRipple
      onClick={() => {
        push({
          title: `Requests`,
          componentId: NAV_COMPONENT_MESSAGE_REQUESTS,
          componentProps: {},
        });
      }}
      style={{
        padding: "10px",
        paddingLeft: "16px",
        paddingRight: "16px",
        display: "flex",
        height: "80px",
        backgroundColor: theme.custom.colors.nav,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{ flex: 1, display: "flex", justifyContent: "space-between" }}
        >
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  padding: 10,
                  background: theme.custom.colors.background,
                  borderRadius: 20,
                  display: "flex",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <MarkChatUnreadIcon
                    style={{ color: theme.custom.colors.icon, width: 18 }}
                  />
                </div>
              </div>
            </div>
            <div>
              <div
                className={classes.userTextSmall}
                style={{ fontWeight: 600 }}
              >
                Message requests
              </div>
              <div className={classes.userTextSmall}>
                {requestCount === 1 ? "1 person" : `${requestCount} people`} you
                may know
              </div>
            </div>
          </div>
        </div>
      </div>
    </ListItem>
  );
}

function UserIcon({ image }: any) {
  const classes = useStyles();
  return <ProxyImage src={image} className={classes.iconCircularBig} />;
}
