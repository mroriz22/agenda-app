import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const appName = process.env.APP_NAME ?? "SmartDayZ";

export const metadata: Metadata = {
  title: `${appName} — sua agenda no seu melhor horário`,
  description:
    "Organize o dia pelo seu ritmo biológico: tarefa difícil no pico de energia, tarefa leve na queda. Com IA que resolve a tarefa por você.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
