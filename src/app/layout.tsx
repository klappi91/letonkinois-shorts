import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Le Tonkinois Shorts — Video Dashboard",
  description:
    "Instagram Reels & Shorts Dashboard für Le Tonkinois Holzschutz. Review, bewerte und veröffentliche Video-Content.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Lato:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
