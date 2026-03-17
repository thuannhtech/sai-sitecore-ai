import "./globals.css";
import { Roboto, Manrope } from "next/font/google";

// Configure the fonts
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-manrope",
});

import { OrderCloudProvider } from "@/providers/OrderCloudProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${roboto.variable} ${manrope.variable}`}>
      <body className="font-manrope">
        <OrderCloudProvider>
          {children}
        </OrderCloudProvider>
      </body>
    </html>
  );
}
