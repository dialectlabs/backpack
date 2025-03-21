//
// Communication channels for the main application UI (extension or mobile) and
// the background script.
//

import type { RpcRequest } from "@coral-xyz/common-public";
import { generateUniqueId } from "@coral-xyz/common-public";

import { BrowserRuntimeCommon } from "../browser";
import type { Notification, RpcResponse } from "../types";

export interface BackgroundClient {
  request<T = any>({ method, params }: RpcRequest): Promise<RpcResponse<T>>;
}

export class ChannelAppUi {
  public static client(name: string): ChannelAppUiClient {
    return new ChannelAppUiClient(name);
  }

  public static responder(name: string): ChannelAppUiResponder {
    return new ChannelAppUiResponder(name);
  }

  public static server(name: string): ChannelAppUiServer {
    return new ChannelAppUiServer(name);
  }

  public static notifications(name: string): ChannelAppUiNotifications {
    return new ChannelAppUiNotifications(name);
  }
}

// This check is necessary otherwise chrome.runtime.id will explode in React Native
function isReactNative() {
  if (typeof window !== "undefined" && typeof window.document !== "undefined") {
    return false;
  }

  return true;
}

export class ChannelAppUiServer {
  constructor(private name: string) {}

  public handler(handlerFn: (req: RpcRequest) => Promise<RpcResponse>) {
    BrowserRuntimeCommon.addEventListenerFromBackground(
      (msg: any, sender: any, sendResponse: any) => {
        if (msg.channel !== this.name) {
          return;
        }

        if (!isReactNative()) {
          if (chrome && chrome?.runtime?.id) {
            if (sender.id !== chrome.runtime.id) {
              return;
            }
          }
        }

        const id = msg.data.id;
        handlerFn(msg.data)
          .then((resp) => {
            const [result, error] = resp;
            sendResponse({ id, result, error });
          })
          .catch((err) => {
            sendResponse({ id, error: err.toString() });
          });
        return true;
      }
    );
  }
}

export class ChannelAppUiNotifications {
  constructor(private name: string) {}

  public onNotification(handlerFn: (notif: Notification) => void) {
    BrowserRuntimeCommon.addEventListenerFromAppUi(
      (msg: any, sender: any, sendResponse: any) => {
        if (msg.channel !== this.name) {
          return;
        }

        if (!isReactNative()) {
          if (chrome && chrome?.runtime?.id) {
            if (sender.id !== chrome.runtime.id) {
              return;
            }
          }
        }

        handlerFn(msg.data);
        sendResponse({ result: "success" });
      }
    );
  }

  public pushNotification(notif: Notification) {
    BrowserRuntimeCommon.sendMessageToAppUi({
      channel: this.name,
      data: notif,
    });
  }
}

export class ChannelAppUiClient implements BackgroundClient {
  constructor(private name: string) {}

  public async request<T = any>({
    method,
    params,
  }: RpcRequest): Promise<RpcResponse<T>> {
    const id = generateUniqueId();
    return new Promise((resolve, reject) => {
      BrowserRuntimeCommon.sendMessageToBackground(
        {
          channel: this.name,
          data: { id, method, params },
        },
        ({ id, result, error }: any) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        }
      );
    });
  }
}

// Must be used from the frontend app code.
export class ChannelAppUiResponder {
  constructor(private name: string) {}

  public async response<T = any>({
    id,
    result,
  }: RpcResponse): Promise<RpcResponse<T>> {
    return new Promise((resolve, reject) => {
      BrowserRuntimeCommon.sendMessageToBackground(
        {
          channel: this.name,
          data: { id, result },
        },
        (response: any) => {
          resolve(response);
        }
      );
    });
  }
}
