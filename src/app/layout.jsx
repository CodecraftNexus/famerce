import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL),
  title: {
    default: "Farmers Fertilizer Management System",
    template: "%s | Farmers Fertilizer"
  },
  description: "Complete fertilizer product management and tracking system with QR code generation and batch monitoring",
  keywords: [
    "fertilizer", 
    "agriculture", 
    "management", 
    "tracking", 
    "batches", 
    "QR codes", 
    "inventory",
    "farmers",
    "crop nutrition"
  ],
  authors: [{ name: "Creative Hub" }],
  creator: "Creative Hub",
  publisher: "Farmers Fertilizer",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_FRONTEND_URL,
    siteName: 'Farmers Fertilizer',
    title: 'Farmers Fertilizer Management System',
    description: 'Complete fertilizer product management and tracking system',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link 
          href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' 
          rel='stylesheet'
        />
        <meta name="msapplication-TileColor" content="#4ade80" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <div id="root">
          {children}
        </div>
        <div id="modal-root"></div>
      </body>
    </html>
  );
}