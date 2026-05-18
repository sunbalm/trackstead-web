import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import Nav from "../components/Nav";
import PwaRegister from "../components/PwaRegister";

export const metadata = {
  title: "Clearwell",
  description: "Track habits, recovery, health, money, and personal progress.",
  manifest: "/manifest.json",
  themeColor: "#6d9dfc",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Clearwell"
  },
  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    apple: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      }
    ]
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#6d9dfc"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        <AuthProvider>
          <div className="page">
            <Nav />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}