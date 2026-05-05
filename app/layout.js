import './globals.css'

export const metadata = {
  title: 'NefroPlaner Badania',
  description: 'Aplikacja do planowania badań pacjentów',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
