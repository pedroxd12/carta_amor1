/**
 * Configuración del árbol de amor
 * Personaliza esta configuración con tu información
 */

window.config = {
    /** Mensajes de amor que se mostrarán con efecto typewriter */
    lines: [
        "Querida amor mío",
        "Las flores florecen en su temporada, dejando pétalos como recuerdo",
        "Los años que pasan, ¿cómo pueden desvanecerse en el polvo?",
        "Tu sonrisa es mi eterno anhelo",
        "Este verdadero sentimiento de amor mutuo, espero que lo comprendas",
        "Cariño mío, eres mi única razón de ser",
        "Te amaré por siempre...",
    ],
    
    /** Fecha de inicio de la relación - Formato: AAAA-MM-DDTHH:MM:SS */
    date: "2023-12-28T20:00:00",
    
    /** Nombres de la pareja */
    names: ["Pedro", "Alondra"],
    
    /** Configuración de presentación de fotos */
    photos: {
        folder: "./fotos/",          // Ruta de la carpeta de fotos
        count: 100,                   // Cantidad total de fotos (1.jpg, 2.jpg, ... N.jpg)
        displayDuration: 4,           // Segundos que se muestra cada foto
        transitionDuration: 1         // Segundos de transición entre fotos
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.config;
}

