import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'LearnTube — Tu YouTube para aprender',
  description: 'Convierte videos de YouTube con capítulos en cursos de aprendizaje estructurados. Controla tu progreso y aprende a tu ritmo.',
  keywords: 'youtube, learning, courses, chapters, education',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

