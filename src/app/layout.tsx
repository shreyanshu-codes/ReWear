import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { WardrobeProvider } from '@/hooks/use-wardrobe';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'ReWear Stylist',
  description: 'Your personal AI-powered stylist',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <AuthProvider>
          <WardrobeProvider>
            {children}
            <Toaster />
          </WardrobeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
