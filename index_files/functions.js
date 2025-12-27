'use strict';

/** Clase para efecto de escritura animada */
class Typewriter {
    constructor(element, text, speed = 75) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.progress = 0;
    }

    async start() {
        this.element.innerHTML = '';
        
        return new Promise((resolve) => {
            const timer = setInterval(() => {
                const current = this.text.charAt(this.progress);
                
                if (current === '<') {
                    this.progress = this.text.indexOf('>', this.progress) + 1;
                } else {
                    this.progress++;
                }
                
                const cursor = (this.progress & 1) ? '_' : '';
                this.element.innerHTML = this.text.substring(0, this.progress) + cursor;
                
                if (this.progress >= this.text.length) {
                    clearInterval(timer);
                    this.element.innerHTML = this.text;
                    resolve();
                }
            }, this.speed);
        });
    }
}

/** Calcula y muestra el tiempo transcurrido desde una fecha */
function timeElapse(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const pad = (num) => String(num).padStart(2, '0');
    
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        const width = window.innerWidth;
        
        if (width <= 420) {
            clockElement.innerHTML = `<span class="digit">${days}</span>d <span class="digit">${pad(hours)}</span>h <span class="digit">${pad(minutes)}</span>m <span class="digit">${pad(secs)}</span>s`;
        } else if (width <= 600) {
            clockElement.innerHTML = `
                <span class="digit">${days}</span> días 
                <span class="digit">${pad(hours)}</span>h 
                <span class="digit">${pad(minutes)}</span>m 
                <span class="digit">${pad(secs)}</span>s
            `;
        } else if (width <= 900) {
            clockElement.innerHTML = `
                <span class="digit">${days}</span> días 
                <span class="digit">${pad(hours)}</span> horas 
                <span class="digit">${pad(minutes)}</span> min 
                <span class="digit">${pad(secs)}</span> seg
            `;
        } else {
            clockElement.innerHTML = `
                <span class="digit">${days}</span> días 
                <span class="digit">${pad(hours)}</span> horas 
                <span class="digit">${pad(minutes)}</span> minutos 
                <span class="digit">${pad(secs)}</span> segundos
            `;
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.sleep = sleep;

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const canvas = document.getElementById('canvas');
        if (canvas) {
            const wrap = document.getElementById('wrap');
            const width = wrap.clientWidth;
            const height = wrap.clientHeight;
            
            if (canvas.width !== width || canvas.height !== height) {
                location.reload();
            }
        }
    }, 250);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Typewriter, timeElapse, sleep };
}
