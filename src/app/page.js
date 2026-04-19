'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="landing-page">
      <header className="landing-header">
        <span className="landing-logo">Learntub</span>
        <div className="landing-nav">
          <button onClick={() => router.push('/login')}>Iniciar Sesión</button>
        </div>
      </header>

      <div className="landing-body">
        {/* Columna izquierda */}
        <div className="landing-left">
          <h1 className="landing-headline">
            Estructura tu<br />aprendizaje<br />en YouTube
          </h1>
          <p className="landing-desc">
            Pega el enlace de cualquier video de YouTube con capítulos y conviértelo en un curso estructurado con módulos, progreso y seguimiento por sesión.
          </p>
          <ul className="feature-list">
            <li>Extracción automática de capítulos desde la descripción del video</li>
            <li>Reproducción por módulo con control de inicio y fin</li>
            <li>Seguimiento de progreso por módulo completado</li>
            <li>Sincronización en la nube con cuenta de Google</li>
          </ul>
          <div className="landing-cta">
            <button className="btn-primary" onClick={() => router.push('/login')}>
              Comenzar Ahora
            </button>
            <a
              href="https://github.com/WakeUpFern/Learntub"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              Ver en GitHub
            </a>
          </div>
        </div>

        {/* Columna derecha: preview de tabla */}
        <div className="landing-right">
          <div className="preview-table-label">Vista Previa — Biblioteca de Cursos</div>
          <table className="course-table" style={{ marginTop: 0 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Título del Curso</th>
                <th>Canal</th>
                <th>Módulos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>001</td>
                <td>Introducción a Next.js 14</td>
                <td>Midudev</td>
                <td>12/18</td>
                <td><span className="status-badge active">En Progreso</span></td>
              </tr>
              <tr>
                <td>002</td>
                <td>Go Completo desde Cero</td>
                <td>Fazt Code</td>
                <td>24/24</td>
                <td><span className="status-badge done">Completado</span></td>
              </tr>
              <tr>
                <td>003</td>
                <td>Docker para Desarrolladores</td>
                <td>TechWorld</td>
                <td>0/15</td>
                <td><span className="status-badge pending">Pendiente</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Learntub</span>
        <span>Hecho con 🫶 para aprender mejor</span>
      </footer>
    </div>
  );
}
