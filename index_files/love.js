'use strict';

(function(window) {

    const random = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

    const bezier = (cp, t) => {
        const p1 = cp[0].mul((1 - t) * (1 - t));
        const p2 = cp[1].mul(2 * t * (1 - t));
        const p3 = cp[2].mul(t * t);
        return p1.add(p2).add(p3);
    };

    /** Verifica si un punto está dentro de la forma de corazón */
    const inheart = (x, y, r) => {
        const normalized = (coord) => coord / r;
        const xn = normalized(x);
        const yn = normalized(y);
        const term = xn * xn + yn * yn - 1;
        const z = term * term * term - xn * xn * yn * yn * yn;
        return z < 0;
    };

    /** Clase Point para operaciones vectoriales */
    class Point {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        clone() {
            return new Point(this.x, this.y);
        }

        add(o) {
            const p = this.clone();
            p.x += o.x;
            p.y += o.y;
            return p;
        }

        sub(o) {
            const p = this.clone();
            p.x -= o.x;
            p.y -= o.y;
            return p;
        }

        div(n) {
            const p = this.clone();
            p.x /= n;
            p.y /= n;
            return p;
        }

        mul(n) {
            const p = this.clone();
            p.x *= n;
            p.y *= n;
            return p;
        }
    }

    /** Clase Heart - Figura del corazón con ecuación paramétrica */
    class Heart {
        constructor() {
            const points = [];
            for (let i = 10; i < 30; i += 0.2) {
                const t = i / Math.PI;
                const x = 16 * Math.pow(Math.sin(t), 3);
                const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 
                          2 * Math.cos(3 * t) - Math.cos(4 * t);
                points.push(new Point(x, y));
            }
            this.points = points;
            this.length = points.length;
        }

        get(i, scale = 1) {
            return this.points[i].mul(scale);
        }
    }

    /** Clase Seed - Corazón interactivo inicial */
    class Seed {
        constructor(tree, point, scale = 1, color = '#FF0000') {
            this.tree = tree;
            this.heart = {
                point,
                scale,
                color,
                figure: new Heart()
            };
            this.cirle = {
                point,
                scale,
                color,
                radius: 5
            };
        }

        draw() {
            this.drawHeart();
            this.drawText();
        }

        addPosition(x, y) {
            this.heart.point = this.heart.point.add(new Point(x, y));
            this.cirle.point = this.cirle.point.add(new Point(x, y));
        }

        canMove() {
            return this.cirle.point.y < (this.tree.height + 20);
        }

        move(x, y) {
            this.clear();
            this.drawCirle();
            this.addPosition(x, y);
        }

        canScale() {
            return this.heart.scale > 0.2;
        }

        setHeartScale(scale) {
            this.heart.scale *= scale;
        }

        scale(scale) {
            this.clear();
            this.drawCirle();
            this.drawHeart();
            this.setHeartScale(scale);
        }

        drawHeart() {
            const ctx = this.tree.ctx;
            const { point, color, scale, figure } = this.heart;
            
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            
            for (let i = 0; i < figure.length; i++) {
                const p = figure.get(i, scale);
                ctx.lineTo(p.x, -p.y);
            }
            
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        drawCirle() {
            const ctx = this.tree.ctx;
            const { point, color, scale, radius } = this.cirle;
            
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        drawText() {
            const ctx = this.tree.ctx;
            const { point, color, scale } = this.heart;
            
            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.moveTo(0, 0);
            ctx.lineTo(15, 15);
            ctx.lineTo(60, 15);
            ctx.stroke();

            ctx.moveTo(0, 0);
            ctx.scale(0.75, 0.75);
            ctx.font = "12px 'Segoe UI', Arial, sans-serif";
            ctx.fillText("haz clic aquí", 23, 16);
            ctx.restore();
        }

        clear() {
            const ctx = this.tree.ctx;
            const { point, scale } = this.cirle;
            const radius = 26;
            const w = radius * scale, h = radius * scale;
            ctx.clearRect(point.x - w, point.y - h, 4 * w, 4 * h);
        }

        /** Verifica si el cursor está sobre el corazón (adaptado para móviles) */
        hover(x, y) {
            const { point, scale } = this.cirle;
            const visualRadius = 26 * scale;
            const treeWidth = this.tree.width;
            const minTouchRadius = Math.max(40, treeWidth * 0.05);
            const hitRadius = Math.max(visualRadius, minTouchRadius);
            
            const dx = x - point.x;
            const dy = y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            return distance <= hitRadius;
        }
    }

    /** Clase Footer - Base del árbol */
    class Footer {
        constructor(tree, width, height, speed = 2) {
            this.tree = tree;
            this.point = new Point(tree.seed.heart.point.x, tree.height - height / 2);
            this.width = width;
            this.height = height;
            this.speed = speed;
            this.length = 0;
        }

        draw() {
            const ctx = this.tree.ctx;
            const len = this.length / 2;

            ctx.save();
            ctx.strokeStyle = 'rgb(35, 31, 32)';
            ctx.lineWidth = this.height;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.translate(this.point.x, this.point.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(len, 0);
            ctx.lineTo(-len, 0);
            ctx.stroke();
            ctx.restore();

            if (this.length < this.width) {
                this.length += this.speed;
            }
        }
    }

    /** Clase Tree - Árbol principal del canvas */
    class Tree {
        constructor(canvas, width, height, opt = {}) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d', { willReadFrequently: true });
            this.width = width;
            this.height = height;
            this.opt = opt;
            this.record = {};
            
            this.initSeed();
            this.initFooter();
            this.initBranch();
            this.initBloom();
        }

        initSeed() {
            const seed = this.opt.seed || {};
            const x = seed.x || this.width / 2;
            const y = seed.y || this.height / 2;
            const point = new Point(x, y);
            const color = seed.color || '#FF0000';
            const scale = seed.scale || 1;

            this.seed = new Seed(this, point, scale, color);
        }

        initFooter() {
            const footer = this.opt.footer || {};
            const width = footer.width || this.width;
            const height = footer.height || 5;
            const speed = footer.speed || 2;
            this.footer = new Footer(this, width, height, speed);
        }

        initBranch() {
            const branchs = this.opt.branch || [];
            this.branchs = [];
            this.addBranchs(branchs);
        }

        initBloom() {
            const bloom = this.opt.bloom || {};
            const cache = [];
            const num = bloom.num || 500;
            const width = bloom.width || this.width;
            const height = bloom.height || this.height;
            const figure = this.seed.heart.figure;
            const r = Math.min(240 * (width / 1100), 240);
            
            for (let i = 0; i < num; i++) {
                const place = new Point(random(-100, width + 100), height + 50);
                const speed = random(200, 300);
                cache.push(this.createBloom(width, height, r, figure, null, null, null, null, place, speed));
            }
            
            this.blooms = [];
            this.bloomsCache = cache;
        }

        toDataURL(type) {
            return this.canvas.toDataURL(type);
        }

        draw(k) {
            const rec = this.record[k];
            if (!rec) return;

            const { point, image } = rec;
            this.ctx.save();
            this.ctx.putImageData(image, point.x, point.y);
            this.ctx.restore();
        }

        addBranch(branch) {
            this.branchs.push(branch);
        }

        addBranchs(branchs) {
            for (const b of branchs) {
                const [x1, y1, x2, y2, x3, y3, r, l, c] = b;
                const p1 = new Point(x1, y1);
                const p2 = new Point(x2, y2);
                const p3 = new Point(x3, y3);
                this.addBranch(new Branch(this, p1, p2, p3, r, l, c));
            }
        }

        removeBranch(branch) {
            const index = this.branchs.indexOf(branch);
            if (index > -1) {
                this.branchs.splice(index, 1);
            }
        }

        canGrow() {
            return this.branchs.length > 0;
        }

        grow() {
            for (const branch of this.branchs) {
                if (branch) branch.grow();
            }
        }

        addBloom(bloom) {
            this.blooms.push(bloom);
        }

        removeBloom(bloom) {
            const index = this.blooms.indexOf(bloom);
            if (index > -1) {
                this.blooms.splice(index, 1);
            }
        }

        createBloom(width, height, radius, figure, color, alpha, angle, scale, place, speed) {
            let x, y;
            let attempts = 0;
            const maxAttempts = 100;
            
            while (attempts < maxAttempts) {
                x = random(20, width - 20);
                y = random(20, height - 20);
                if (inheart(x - width / 2, height - (height - 40) / 2 - y, radius)) {
                    return new Bloom(this, new Point(x, y), figure, color, alpha, angle, scale, place, speed);
                }
                attempts++;
            }
            
            x = random(20, width - 20);
            y = random(20, height - 20);
            return new Bloom(this, new Point(x, y), figure, color, alpha, angle, scale, place, speed);
        }

        canFlower() {
            return this.bloomsCache.length > 0;
        }

        flower(num) {
            const blooms = this.bloomsCache.splice(0, num);
            for (const bloom of blooms) {
                this.addBloom(bloom);
            }
            
            for (const bloom of this.blooms) {
                bloom.flower();
            }
        }

        snapshot(k, x, y, width, height) {
            const image = this.ctx.getImageData(x, y, width, height);
            this.record[k] = {
                image,
                point: new Point(x, y),
                width,
                height
            };
        }

        setSpeed(k, speed) {
            this.record[k || 'move'].speed = speed;
        }

        move(k, x, y) {
            const rec = this.record[k || 'move'];
            const { point, image, width, height } = rec;
            let { speed = 10 } = rec;

            const i = point.x + speed < x ? point.x + speed : x;
            const j = point.y + speed < y ? point.y + speed : y;

            this.ctx.save();
            this.ctx.clearRect(point.x, point.y, width, height);
            this.ctx.putImageData(image, i, j);
            this.ctx.restore();

            rec.point = new Point(i, j);
            rec.speed = Math.max(speed * 0.95, 2);

            return i < x || j < y;
        }

        jump() {
            const { blooms } = this;
            
            for (const bloom of blooms) {
                bloom.jump();
            }
            
            if (blooms.length < 3) {
                const bloom = this.opt.bloom || {};
                const width = bloom.width || this.width;
                const height = bloom.height || this.height;
                const figure = this.seed.heart.figure;
                const r = Math.min(240 * (width / 1100), 240);
                
                for (let i = 0; i < random(1, 2); i++) {
                    const newBloom = this.createBloom(
                        width,
                        height,
                        r,
                        figure,
                        null,
                        1,
                        null,
                        1,
                        new Point(random(-100, width + 100), height + 50),
                        random(200, 300)
                    );
                    blooms.push(newBloom);
                }
            }
        }
    }

    /** Clase Branch - Rama del árbol */
    class Branch {
        constructor(tree, point1, point2, point3, radius, length = 100, branchs = []) {
            this.tree = tree;
            this.point1 = point1;
            this.point2 = point2;
            this.point3 = point3;
            this.radius = radius;
            this.length = length;
            this.len = 0;
            this.t = 1 / (this.length - 1);
            this.branchs = branchs;
        }

        grow() {
            if (this.len <= this.length) {
                const p = bezier([this.point1, this.point2, this.point3], this.len * this.t);
                this.draw(p);
                this.len += 1;
                this.radius *= 0.97;
            } else {
                this.tree.removeBranch(this);
                this.tree.addBranchs(this.branchs);
            }
        }

        draw(p) {
            const ctx = this.tree.ctx;
            
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = 'rgb(35, 31, 32)';
            ctx.shadowColor = 'rgb(35, 31, 32)';
            ctx.shadowBlur = 2;
            ctx.arc(p.x, p.y, this.radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    /** Clase Bloom - Pétalos animados */
    class Bloom {
        constructor(tree, point, figure, color, alpha, angle, scale, place, speed) {
            this.tree = tree;
            this.point = point;
            this.color = color || `rgb(255,${random(0, 255)},${random(0, 255)})`;
            this.alpha = alpha || random(0.3, 1);
            this.angle = angle || random(0, 360);
            this.scale = scale || 0.1;
            this.place = place;
            this.speed = speed;
            this.figure = figure;
        }

        setFigure(figure) {
            this.figure = figure;
        }

        flower() {
            this.draw();
            this.scale += 0.1;
            if (this.scale > 1) {
                this.tree.removeBloom(this);
            }
        }

        draw() {
            const ctx = this.tree.ctx;
            const { figure, color, alpha, point, scale, angle } = this;

            ctx.save();
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            
            for (let i = 0; i < figure.length; i++) {
                const p = figure.get(i);
                ctx.lineTo(p.x, -p.y);
            }
            
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        jump() {
            const height = this.tree.height;

            if (this.point.x < -20 || this.point.y > height + 20) {
                this.tree.removeBloom(this);
            } else {
                this.draw();
                this.point = this.place.sub(this.point).div(this.speed).add(this.point);
                this.angle += 0.05;
                this.speed -= 1;
            }
        }
    }

    Object.assign(window, {
        random,
        bezier,
        Point,
        Tree
    });

})(window);