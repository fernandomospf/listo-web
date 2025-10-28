import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from 'next/font/google';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});


export const metadata: Metadata = {
  title: "Listo",
  description: "Seu app de controle de atividade",
  icons: [
     {
      url: '/favi.png',
      type: "image/png",
      sizes: "32x32",
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}>
        <div className="layout-container">
          <main className="main-content">
            {children}
          </main>
          <footer className="footer">
            <div className="footer-content">
              Listo | Seu app de gerenciamento gratuito
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}