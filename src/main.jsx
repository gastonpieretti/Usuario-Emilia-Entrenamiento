import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Componente para inyectar estilos globales.
const GlobalStyles = () => {
    return (
        <style dangerouslySetInnerHTML={{ __html: `
            /* Carga Tailwind CSS - aunque en React se usa como clases, esto asegura un fallback */
            @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
            
            /* Estilos de fuente y reseteo */
            body, html { 
                margin: 0; 
                padding: 0; 
                min-height: 100vh; /* Asegura que el fondo cubra toda la altura */
                font-family: 'Inter', system-ui, sans-serif; 
                background-color: #f9fafb; 
            }
        ` }} />
    );
};

// Montaje de la aplicación en el DOM
// React busca el elemento con ID 'root' y monta el componente App allí.
const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <GlobalStyles />
        <App />
      </React.StrictMode>,
    );
} else {
    // Manejo de errores en caso de que el index.html no esté correcto
    console.error("No se encontró el elemento con id 'root'. El HTML base está incompleto.");
}