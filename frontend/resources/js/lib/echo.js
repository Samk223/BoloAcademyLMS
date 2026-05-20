import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export function createEcho() {
  const config = window.pusherConfig || {};
  const key = config.key || import.meta.env.VITE_PUSHER_APP_KEY;
  const host = config.host || import.meta.env.VITE_PUSHER_HOST;
  const port = config.port || import.meta.env.VITE_PUSHER_PORT;
  const scheme = config.scheme || import.meta.env.VITE_PUSHER_SCHEME || 'https';
  const cluster = config.cluster || import.meta.env.VITE_PUSHER_APP_CLUSTER;

  if (!key) return null;

  window.Pusher = Pusher;

  const options = {
    broadcaster: 'pusher',
    key,
    cluster,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
  };

  if (host) {
    options.wsHost = host;
    options.wsPort = port ? Number(port) : undefined;
    options.wssPort = port ? Number(port) : undefined;
  }

  return new Echo(options);
}
