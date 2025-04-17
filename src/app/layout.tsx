import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gigi the Robot",
  description: "A genie in a bottle",
  icons: {
    icon: '/gigi-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
