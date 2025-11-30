import "./globals.css";
import { Poppins } from "next/font/google";
import Script from "next/script";


const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        {children}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
