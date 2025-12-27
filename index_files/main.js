/**
 * Script principal - Lógica de animación sin Jscex
 * Versión moderna con async/await nativo
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    
    if (!canvas || !canvas.getContext) {
        document.getElementById('error').style.display = 'block';
        return;
    }

    const wrap = document.getElementById('wrap');
    const baseWidth = 1100;
    const baseHeight = 680;
    
    const wrapRect = wrap.getBoundingClientRect();
    const width = Math.floor(wrapRect.width);
    const height = Math.floor(wrapRect.height);
    const scale = width / baseWidth;

    canvas.width = width;
    canvas.height = height;

    const s = scale;
    const opts = {
        seed: {
            x: width / 2 - 20 * s,
            y: height / 2,
            color: 'rgb(190, 26, 37)',
            scale: 2 * s
        },
        branch: [
            [535*s, 680*s, 570*s, 250*s, 500*s, 200*s, 30*s, 100, [
                [540*s, 500*s, 455*s, 417*s, 340*s, 400*s, 13*s, 100, [
                    [450*s, 435*s, 434*s, 430*s, 394*s, 395*s, 2*s, 40]
                ]],
                [550*s, 445*s, 600*s, 356*s, 680*s, 345*s, 12*s, 100, [
                    [578*s, 400*s, 648*s, 409*s, 661*s, 426*s, 3*s, 80]
                ]],
                [539*s, 281*s, 537*s, 248*s, 534*s, 217*s, 3*s, 40],
                [546*s, 397*s, 413*s, 247*s, 328*s, 244*s, 9*s, 80, [
                    [427*s, 286*s, 383*s, 253*s, 371*s, 205*s, 2*s, 40],
                    [498*s, 345*s, 435*s, 315*s, 395*s, 330*s, 4*s, 60]
                ]],
                [546*s, 357*s, 608*s, 252*s, 678*s, 221*s, 6*s, 100, [
                    [590*s, 293*s, 646*s, 277*s, 648*s, 271*s, 2*s, 80]
                ]]
            ]]
        ],
        bloom: {
            num: Math.floor(500 * Math.min(scale, 1)),
            width: width,
            height: height
        },
        footer: {
            width: width,
            height: 5 * s,
            speed: 10 * s
        }
    };

    const tree = new Tree(canvas, width, height, opts);
    const seed = tree.seed;
    const foot = tree.footer;
    let hold = true;
    
    seed.draw();

    /** Manejar clics y toques en el canvas */
    const handleClick = (e) => {
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);
        
        if (!clientX || !clientY) return;
        
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        if (seed.hover(x, y)) {
            
            const audio = document.querySelector('.song-audio-autoplay');
            if (audio) {
                audio.volume = 0.5;
                audio.play().catch(() => {});
            }
            
            wrap.classList.add('opening');
            setTimeout(() => {
                wrap.classList.remove('opening');
                wrap.classList.add('opened');
            }, 400);
            
            hold = false;
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('touchstart', handleClick);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.classList.remove('hand');
            
            runAnimations().catch(() => {});
        } else {
        }
    };

    const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        canvas.classList.toggle('hand', seed.hover(x, y));
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);

    /** Animación de la semilla inicial */
    async function seedAnimate() {
        seed.draw();
        
        while (hold) {
            await sleep(10);
        }
        
        while (seed.canScale()) {
            seed.scale(0.95);
            await sleep(10);
        }
        
        // Velocidad de movimiento: más lenta en pantallas pequeñas
        const moveSpeed = Math.max(1, 2 * scale);
        const moveDelay = scale < 0.6 ? 15 : 10; // Más lento en móviles
        while (seed.canMove()) {
            seed.move(0, moveSpeed);
            foot.draw();
            await sleep(moveDelay);
        }
    }

    /** Animación de crecimiento del árbol */
    async function growAnimate() {
        const growDelay = scale < 0.6 ? 15 : (scale < 0.8 ? 12 : 10);
        while (tree.canGrow()) {
            tree.grow();
            await sleep(growDelay);
        }
    }

    /** Animación de florecimiento */
    async function flowAnimate() {
        const flowersPerFrame = scale < 0.6 ? 1 : 2;
        const flowDelay = scale < 0.6 ? 18 : (scale < 0.8 ? 14 : 10);
        
        while (tree.canFlower()) {
            tree.flower(flowersPerFrame);
            await sleep(flowDelay);
        }
    }

    /** Animación de movimiento del árbol */
    async function moveAnimate() {
        const p1X = Math.floor(240 * scale);
        const p1Width = Math.floor(610 * scale);
        const p2X = Math.floor(500 * scale);
        
        tree.snapshot('p1', p1X, 0, p1Width, height);
        
        const moveDelay = scale < 0.6 ? 15 : (scale < 0.8 ? 12 : 10);
        while (tree.move('p1', p2X, 0)) {
            foot.draw();
            await sleep(moveDelay);
        }
        
        foot.draw();
        tree.snapshot('p2', p2X, 0, p1Width, height);
        
        // Mostrar nombres y reloj suavemente después del desplazamiento
        await sleep(500); 
        
        const clockBox = document.getElementById('clock-box');
        const together = new Date(window.config.date);
        
        clockBox.style.display = 'block';
        clockBox.style.opacity = '0';
        
        timeElapse(together);
        
        let opacity = 0;
        while (opacity < 1) {
            opacity += 0.08;
            clockBox.style.opacity = opacity;
            await sleep(30);
        }
        
        setInterval(() => timeElapse(together), 1000);
    }

    /** Animación de pétalos cayendo */
    async function jumpAnimate() {
        while (true) {
            tree.ctx.clearRect(0, 0, width, height);
            tree.draw('p2'); // Redibujar el árbol desde su snapshot
            tree.jump(); // Dibujar y animar los pétalos cayendo
            foot.draw();
            await sleep(25);
        }
    }

    /** Animación de escritura de texto */
    async function textAnimate() {
        const codeElement = document.getElementById('code');
        codeElement.style.display = 'block';
        codeElement.innerHTML = '';
        
        const typeSpeed = scale < 0.6 ? 90 : (scale < 0.8 ? 80 : 70);
        const linePause = scale < 0.6 ? 180 : (scale < 0.8 ? 150 : 120);
        
        const lines = window.config.lines;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const span = document.createElement('span');
            span.className = 'say';
            span.textContent = line;
            codeElement.appendChild(span);
            codeElement.appendChild(document.createElement('br'));
            
            let text = '';
            for (let j = 0; j < line.length; j++) {
                text += line[j];
                span.textContent = text + (j < line.length - 1 ? '_' : '');
                await sleep(typeSpeed);
            }
            span.textContent = line;
            
            await sleep(linePause);
        }
    }

    /** Animación de presentación de fotos */
    async function photoAnimate() {
        const photoConfig = window.config.photos;
        if (!photoConfig || !photoConfig.count) return;

        const photoContainer = document.getElementById('photo-container');
        if (!photoContainer) return;

        await sleep(2000);
        photoContainer.style.display = 'block';

        const { folder, count, displayDuration, transitionDuration } = photoConfig;
        const totalDuration = displayDuration + transitionDuration;
        
        const audio = document.querySelector('.song-audio-autoplay');
        const songDuration = audio && audio.duration ? audio.duration : count * totalDuration;
        const interval = (songDuration / count) * 1000;

        for (let i = 1; i <= count; i++) {
            const photoFrame = document.createElement('div');
            photoFrame.className = 'photo-frame';
            
            const img = document.createElement('img');
            img.style.opacity = '0';
            
            img.onload = function() {
                this.style.opacity = '1';
            };
            
            img.src = `${folder}${i}.jpg`;
            img.alt = ``;
            
            img.onerror = function() {
                if (this.src.endsWith('.jpg')) {
                    this.src = this.src.replace('.jpg', '.png');
                } else if (this.src.endsWith('.png')) {
                    this.src = this.src.replace('.png', '.jpeg');
                } else {
                    photoFrame.style.display = 'none';
                }
            };
            
            photoFrame.appendChild(img);
            photoContainer.appendChild(photoFrame);
            
            await sleep(50);
            photoFrame.classList.add('show');
            await sleep(displayDuration * 1000);
            photoFrame.classList.remove('show');
            photoFrame.classList.add('hide');
            await sleep(transitionDuration * 1000);
        }
    }

    /** Ejecutar secuencia completa de animaciones */
    async function runAnimations() {
        await seedAnimate();
        await growAnimate();
        await flowAnimate();
        await moveAnimate();
        textAnimate();
        photoAnimate();
        await jumpAnimate();
    }
});
