import "@/style/index.css";

export const metadata = {
  title: "MOBB",
  description:
    "The Map of 'Black' Businesses. Give your dollar the choice to make a difference... Just MOBB It.",
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
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
