import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ChessGame from './ChessGame.tsx';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

const renderApp = () => {
  root.render(
    <StrictMode>
      <ChessGame />
    </StrictMode>
  );
};

const isTelegram = typeof (window as any).Telegram !== "undefined";
const isFacebook = typeof (window as any).FBInstant !== "undefined";

const loadFacebookSDK = (): Promise<void> => {
  console.log("Loading Facebook SDK...");
  return new Promise((resolve, reject) => {
    if (isFacebook) return resolve(); // Already loaded
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/fbinstant.6.3.js";
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
    console.log("FBInstant SDK loaded");
  });
};

const loadTelegramSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isTelegram) return resolve(); // Already loaded
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

(async () => {
  const hostname = window.location.hostname;
  console.log("Hostname:", hostname);
  if (hostname.includes("facebook") || hostname.includes("fb.") || hostname.includes(".fb")) {
    await loadFacebookSDK();
    (window as any).FBInstant.initializeAsync()
      .then(() => {
        console.log("FBInstant initialized");
        return (window as any).FBInstant.startGameAsync();
      })
      .then(() => {
        console.log("FBInstant game started");
        renderApp(); // finally render here after FB Instant is initialised!
      })
      .catch((err: any) => {
        console.error("FBInstant error:", err);
      });
  } else if (hostname.includes("t.me") || hostname.includes("telegram")) {
    await loadTelegramSDK();
    (window as any).Telegram?.WebApp?.ready();
    renderApp();
  } else {
    // Plain web or other platforms
    renderApp();
  }
})();
