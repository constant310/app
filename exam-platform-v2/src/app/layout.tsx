import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Exam Bank Admin Command Centre',
  description: 'Internal administration, content quality, publishing and learning analytics for Exam Platform V2.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
