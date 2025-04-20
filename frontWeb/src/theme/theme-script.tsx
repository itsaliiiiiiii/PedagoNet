// This script will run before the page loads to set the theme
// It prevents the flash of incorrect theme
export function ThemeScript() {
    const codeToRunOnClient = `
      (function() {
        try {
          const theme = localStorage.getItem('theme') || 'light';
          document.documentElement.classList.add(theme);
        } catch (e) {
          console.error('Failed to restore theme from localStorage', e);
        }
      })()
    `
  
    // eslint-disable-next-line react/no-danger
    return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />
  }
  