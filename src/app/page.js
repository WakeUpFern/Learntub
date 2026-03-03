'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <div className="landing-page">
      {/* Animated background */}
      <div className="landing-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Hero Section */}
      <main className={`landing-hero ${mounted ? 'visible' : ''}`}>
        <div className="hero-badge">
          <span className="badge-dot" />
          Plataforma de aprendizaje personal
        </div>

        <h1 className="hero-title">
          Convierte <span className="gradient-text">YouTube</span> en tu
          <br />
          plataforma de cursos
        </h1>

        <p className="hero-subtitle">
          Pega el link de cualquier video con capítulos y transfórmalo en un curso
          estructurado con módulos, progreso y seguimiento. Aprende de los mejores
          creadores de contenido, <strong>a tu ritmo</strong>.
        </p>

        <div className="hero-actions">
          <button className="btn-hero-primary" onClick={handleGetStarted}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4l9 6-9 6V4z" fill="currentColor" />
            </svg>
            Comenzar Ahora
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-hero-secondary"
          >
            Ver en GitHub →
          </a>
        </div>

        {/* Feature Cards */}
        <div className="hero-features">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Capítulos Automáticos</h3>
            <p>Detecta automáticamente los timestamps de la descripción del video y los convierte en módulos.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Progreso Detallado</h3>
            <p>Marca módulos como completados y visualiza cuánto has avanzado en cada curso.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎬</div>
            <h3>Reproducción Inteligente</h3>
            <p>Reproduce solo el fragmento del video que corresponde a cada módulo, sin distracciones.</p>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="hero-preview">
          <div className="preview-window">
            <div className="preview-titlebar">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
              <span className="preview-url">learntube.app/dashboard</span>
            </div>
            <div className="preview-body">
              <div className="preview-sidebar">
                <div className="preview-menu-item active">📊 Dashboard</div>
                <div className="preview-menu-item">📚 Mis Cursos</div>
                <div className="preview-menu-item">⭐ Completados</div>
              </div>
              <div className="preview-main">
                <div className="preview-card-row">
                  <div className="preview-card shimmer">
                    <div className="pc-thumb" />
                    <div className="pc-lines">
                      <div className="pc-line long" />
                      <div className="pc-line short" />
                      <div className="pc-bar"><div className="pc-bar-fill" style={{ width: '72%' }} /></div>
                    </div>
                  </div>
                  <div className="preview-card shimmer">
                    <div className="pc-thumb" />
                    <div className="pc-lines">
                      <div className="pc-line long" />
                      <div className="pc-line short" />
                      <div className="pc-bar"><div className="pc-bar-fill" style={{ width: '35%' }} /></div>
                    </div>
                  </div>
                  <div className="preview-card shimmer">
                    <div className="pc-thumb" />
                    <div className="pc-lines">
                      <div className="pc-line long" />
                      <div className="pc-line short" />
                      <div className="pc-bar"><div className="pc-bar-fill" style={{ width: '100%' }} /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>Hecho con 💜 para aprender mejor desde YouTube</p>
      </footer>
    </div>
  );
}
