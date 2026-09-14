import './globals.css';

export const metadata = {
  title: 'Exam Bank Daily Challenge',
  description: 'Answer a JAMB-style question, get instant feedback, and continue practising in the Exam Bank Telegram bot.',
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
