import './globals.css';
import Nav from '@/components/Nav';

export const metadata = {
  title: 'Repackify Lunch Picker',
  description: 'Interactive lunch picker for the Repackify team near 501 Pedernales St, Austin TX',
  icons: {
    icon: [
      { url: '/images/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/images/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/images/favicon/favicon.ico',
    apple: '/images/favicon/apple-touch-icon.png',
  },
  manifest: '/images/favicon/site.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <div className="app-container page-enter">
          {children}
        </div>
        <canvas id="confetti-canvas" />
      </body>
    </html>
  );
}
