import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'LEARNTUB — SISTEMA DE APRENDIZAJE',
  description: 'Interfaz técnica para la gestión de contenido estructurado en formato de video.',
  keywords: 'youtube, learning, courses, chapters, education',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={jetbrainsMono.variable}>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}

