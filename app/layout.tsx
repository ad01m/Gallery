import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./theme.css";

export const metadata: Metadata = {
  title: "Gallery — Your Personal Photo Space",
  description: "A simple, private space to organise and browse your photos.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#f6f5f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const savedTheme = localStorage.getItem("gallery-theme");
            document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
          } catch {}
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }
        `}}/>
      </body>
    </html>
  );
}
