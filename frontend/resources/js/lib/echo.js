import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export function createEcho() {
  const key = import.meta.env.VITE_PUSHER_APP_KEY;
  const host = import.meta.env.VITE_PUSHER_HOST;
  const port = import.meta.env.VITE_PUSHER_PORT;
  const scheme = import.meta.env.VITE_PUSHER_SCHEME || 'https';

  if (!key) return null;

  window.Pusher = Pusher;

  const options = {
    broadcaster: 'pusher',
    key,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
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
