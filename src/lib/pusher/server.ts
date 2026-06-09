import Pusher from "pusher";

let _pusher: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) return null;

  if (!_pusher) {
    _pusher = new Pusher({ appId, key, secret, cluster, useTLS: true });
  }
  return _pusher;
}

export function chatChannel(roomId: string) {
  return `chat-${roomId}`;
}

export function campaignChannel(campaignId: string) {
  return `campaign-${campaignId}`;
}

export function userChannel(userId: string) {
  return `user-${userId}`;
}
