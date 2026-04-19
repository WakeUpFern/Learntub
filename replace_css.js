const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf-8');

// 1. Reemplazar el bloque :root y el bloque [data-theme="gruvbox"] al final
// Primero, removemos el bloque viejo de gruvbox al final
const gruvboxIndex = css.indexOf('/* GRUVBOX DARK THEME OVERRIDES */');
if (gruvboxIndex !== -1) {
    css = css.substring(0, gruvboxIndex);
}

// Ahora reemplazamos :root
const rootRegex = /:root\s*\{[\s\S]*?\}/;
const newRootAndGruvbox = `:root {
  --font-mono: "JetBrains Mono", "Courier New", monospace;
  --border: 2px solid var(--border-color, #000);
  --border-light: 1px solid var(--border-color, #000);

  /* Light Theme Variables */
  --bg: #fff;
  --bg-secondary: #f8f8f8;
  --bg-tertiary: #eeeeee;
  
  --fg: #000;
  --fg-muted: #555;
  --fg-title: #000;
  --fg-subtitle: #333;
  --fg-accent: #000;
  
  --border-color: #000;
  --border-light-color: #ccc;
  
  --btn-bg: #fff;
  --btn-fg: #000;
  --btn-primary-bg: #000;
  --btn-primary-fg: #fff;
  
  --success-bg: #000;
  --success-fg: #fff;
  --error-bg: #f5f5f5;
  --error-fg: #000;
}

[data-theme="gruvbox"] {
  --bg: #282828 !important;
  --bg-secondary: #3c3836 !important;
  --bg-tertiary: #504945 !important;
  
  --fg: #ebdbb2 !important;
  --fg-muted: #a89984 !important;
  --fg-title: #fabd2f !important; /* Yellow for titles */
  --fg-subtitle: #8ec07c !important; /* Aqua for subtitles */
  --fg-accent: #d3869b !important; /* Purple for highlights */
  
  --border-color: #ebdbb2 !important;
  --border-light-color: #a89984 !important;
  
  --btn-bg: #282828 !important;
  --btn-fg: #ebdbb2 !important;
  --btn-primary-bg: #ebdbb2 !important;
  --btn-primary-fg: #282828 !important;
  
  --success-bg: #b8bb26 !important; /* Green */
  --success-fg: #282828 !important;
  --error-bg: #fb4934 !important; /* Red */
  --error-fg: #282828 !important;
}`;

css = css.replace(rootRegex, newRootAndGruvbox);

// 2. Reemplazos estructurales y semánticos
// Backgrounds
css = css.replace(/background:\s*#fff/g, 'background: var(--bg)');
css = css.replace(/background:\s*#f8f8f8/g, 'background: var(--bg-secondary)');
css = css.replace(/background:\s*#f5f5f5/g, 'background: var(--bg-secondary)');
css = css.replace(/background:\s*#f0f0f0/g, 'background: var(--bg-tertiary)');
css = css.replace(/background:\s*#000/g, 'background: var(--fg)');
css = css.replace(/background-color:\s*#000/g, 'background-color: var(--fg)');

// Colors
css = css.replace(/color:\s*#000/g, 'color: var(--fg)');
css = css.replace(/color:\s*#fff/g, 'color: var(--bg)');
css = css.replace(/color:\s*#555/g, 'color: var(--fg-muted)');
css = css.replace(/color:\s*#333/g, 'color: var(--fg-subtitle)');
css = css.replace(/color:\s*#777/g, 'color: var(--fg-muted)');
css = css.replace(/color:\s*#aaa/g, 'color: var(--fg-muted)');
css = css.replace(/color:\s*#ccc/g, 'color: var(--fg-muted)');

// Borders (algunos bordes están definidos por color)
css = css.replace(/border-color:\s*#000/g, 'border-color: var(--border-color)');
css = css.replace(/border-color:\s*#ccc/g, 'border-color: var(--border-light-color)');
css = css.replace(/border-color:\s*#ddd/g, 'border-color: var(--border-light-color)');
css = css.replace(/border-bottom:\s*1px solid #ccc/g, 'border-bottom: 1px solid var(--border-light-color)');
css = css.replace(/border:\s*2px solid #ccc/g, 'border: 2px solid var(--border-light-color)');

// Aplicar colores de título a encabezados
css = css.replace(/(h1|h2|h3|h4|h5|h6)\s*\{([^}]*)\}/g, (match, tag, rules) => {
    if (!rules.includes('color:')) {
        return `${tag} {${rules} color: var(--fg-title); }`;
    }
    return match;
});

// Aplicar colores a listas y strong
css = css.replace(/strong\s*\{([^}]*)\}/g, (match, rules) => {
    return `strong {${rules} color: var(--fg-accent); }`;
});
if (!css.includes('strong {')) {
    css += '\nstrong { color: var(--fg-accent); }\n';
}

fs.writeFileSync('src/app/globals.css', css);
console.log('CSS Reemplazado');
