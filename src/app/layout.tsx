import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "AI Business Guide",
  description: "Two clear paths: bring your idea or get matched ideas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
