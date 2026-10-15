
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeloClient | Recover More Business",
  description:
    "A clear, intelligent email follow-up workspace for home-service businesses. Find opportunities, organize leads, and follow up with confidence.",
  applicationName: "VeloClient",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
