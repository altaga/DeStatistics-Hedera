import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Providers from "@/app/components/providers";
import HeaderComponent from "@/app/components/headerComponent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DeStatistics",
  description: "DeStatistics - Decentralized Statistics Platform", 
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <HeaderComponent />
          {children}
        </Providers>
      </body>
    </html>
  );
}
