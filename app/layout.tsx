import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Toaster } from "@/components/ui/Toast";
import "@/style/index.css";
import { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  metadataBase: new URL("https://mobb.kielbyrne.com"),
  title: "MOBB | Map of Black Businesses",
  description:
    "The Map of Black Businesses. Give your dollar the choice to make a difference... Just MOBB It.",
  openGraph: {
    title: "MOBB | Map of Black Businesses",
    description: "The digital infrastructure for economic equity. Locate, patronize, and support Black-owned businesses globally.",
    url: "https://mobb.kielbyrne.com",
    siteName: "MOBB",
    images: [
      {
        url: "/img/og-main.png",
        width: 1200,
        height: 630,
        alt: "MOBB - Map of Black Businesses",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MOBB | Map of Black Businesses",
    description: "The digital infrastructure for economic equity. Support Black-owned businesses in your immediate vicinity.",
    images: ["/img/og-main.png"],
  },
  manifest: "/app_manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, minimal-ui"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/img/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/img/icons/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          href="/img/icons/apple-touch-icon-180x180.png"
        />

      </head>
      <body suppressHydrationWarning className={`antialiased bg-black text-white overflow-hidden font-sans ${inter.variable} ${spaceGrotesk.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
