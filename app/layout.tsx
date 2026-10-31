import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gallery — Your Personal Photo Space",
  description: "A beautiful dark-themed personal gallery app",
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="theme-color" content="#7c3aed"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}}/>
      </body>
    </html>
  );
}
