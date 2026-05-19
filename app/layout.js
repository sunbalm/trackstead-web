import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import { ThemeProvider } from "../components/ThemeProvider";
import Nav from "../components/Nav";
import PwaRegister from "../components/PwaRegister";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Trackstead",
  description: "Track habits, recovery, health, money, and personal progress.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Trackstead"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#020817"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        <ThemeProvider>
          <AuthProvider>
            <div className="page">
              <Nav />
              {children}
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}