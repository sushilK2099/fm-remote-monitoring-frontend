import './globals.css';
import { Toaster } from 'sonner';
import OrgGuard from '@/components/OrgGuard';
import ThemeInit from '@/components/ThemeInit';

export const metadata = {
  title: 'FM Maintenance',
  description: 'Facility Management Maintenance System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeInit />
        <OrgGuard>
          {children}
        </OrgGuard>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
