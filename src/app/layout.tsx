import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono, Noto_Serif_Ethiopic, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/components/providers/Providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const notoEthiopic = Noto_Serif_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-ethiopic",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gotera — ጎተራ | Farm to Kitchen",
  description:
    "B2B agricultural supply for Ethiopia. Connect farmers with hotels, restaurants, and wholesalers — without the chaos of Atikilt Tera.",
  metadataBase: new URL("https://gotera.et"),
  openGraph: {
    title: "Gotera — ጎተራ",
    description: "From farm to your kitchen, without the chaos.",
    locale: "en_ET",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f0e8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${playfair.variable} ${notoEthiopic.variable} ${jetbrains.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
