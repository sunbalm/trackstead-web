export const metadata = {
  title: "ClearWell",
  description: "Track your life",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
