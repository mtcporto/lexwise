import type { Metadata } from 'next';
// Removed GeistSans and GeistMono imports
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'LexWise Assistant',
  description: 'Seu assistente jurídico inteligente',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Removed Geist font variables from className
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
