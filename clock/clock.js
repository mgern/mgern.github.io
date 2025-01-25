class AnalogClock {
    constructor(x, y, size, active = false) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.active = active;
        this.hourAngle = Math.random() * Math.PI * 2;
        this.minuteAngle = Math.random() * Math.PI * 2;
        this.startHourAngle = this.hourAngle;
        this.startMinuteAngle = this.minuteAngle;
        this.targetHourAngle = this.hourAngle;
        this.targetMinuteAngle = this.minuteAngle;
    }

    setAngles(hourAngle, minuteAngle) {
        // Store current position as starting point
        this.startHourAngle = this.hourAngle;
        this.startMinuteAngle = this.minuteAngle;
        this.targetHourAngle = hourAngle;
        this.targetMinuteAngle = minuteAngle;
    }

    update(milliseconds) {
        const progress = milliseconds / 1000;
        // Interpolate from current position to target
        this.hourAngle = this.startHourAngle + (this.targetHourAngle - this.startHourAngle) * progress;
        this.minuteAngle = this.startMinuteAngle + (this.targetMinuteAngle - this.startMinuteAngle) * progress;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw clock face
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw hour hand
        ctx.save();
        ctx.rotate(this.hourAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -this.size * 0.3);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Draw minute hand
        ctx.save();
        ctx.rotate(this.minuteAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -this.size * 0.4);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }
}

class DigitalDisplay {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.clocks = new Map();
        this.clockSize = 25;
        this.gridWidth = 18;
        this.gridHeight = 5;
        this.spacing = this.clockSize * 1.2;
        this.digitSpacing = this.clockSize * 2;
        this.lastTime = '';
        
        // Create all clocks initially
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const x = col * this.spacing + Math.floor(col / 6) * this.digitSpacing;
                const y = row * this.spacing;
                const key = `${row}_${col}`;
                this.clocks.set(key, new AnalogClock(x, y, this.clockSize));
            }
        }
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    getAngles(position) {
        const angles = {
            up: 0,           // 12 o'clock
            right: Math.PI/2, // 3 o'clock
            down: Math.PI,    // 6 o'clock
            left: -Math.PI/2  // 9 o'clock
        };
        return [angles[position.hour], angles[position.minute]];
    }

    getDigitPattern(digit) {
        // Each active clock now has specific hand positions
        const patterns = {
            0: [
                {active:1, hour:'down', minute:'right'}, {active:1, hour:'right', minute:'right'}, {active:1, hour:'left', minute:'down'},
                {active:1, hour:'up', minute:'down'}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'up', minute:'down'}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'up', minute:'down'}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'up', minute:'right'}, {active:1, hour:'left', minute:'right'}, {active:1, hour:'left', minute:'up'}
            ],
            1: [
                {active:0}, {active:1, hour:'up', minute:'down'}, {active:0},
                {active:0}, {active:1, hour:'up', minute:'down'}, {active:0},
                {active:0}, {active:1, hour:'up', minute:'down'}, {active:0},
                {active:0}, {active:1, hour:'up', minute:'down'}, {active:0},
                {active:0}, {active:1, hour:'up', minute:'down'}, {active:0}
            ],
            2: [
                {active:1, hour:'right', minute:'right'}, {active:1, hour:'right', minute:'right'}, {active:1, hour:'down', minute:'left'},
                {active:0}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'right', minute:'down'}, {active:1, hour:'right', minute:'right'}, {active:1, hour:'left', minute:'up'},
                {active:1, hour:'up', minute:'down'}, {active:0}, {active:0},
                {active:1, hour:'right', minute:'up'}, {active:1, hour:'right', minute:'right'}, {active:1, hour:'right', minute:'right'}
            ],
            3: [
                {active:1, hour:'right', minute:'right'}, {active:1, hour:'right', minute:'right'}, {active:1, hour:'down', minute:'left'},
                {active:0}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'right', minute:'right'}, {active:1, hour:'right', minute:'right'}, {active:1, hour:'up', minute:'down'},
                {active:0}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'right', minute:'right'}, {active:1, hour:'right', minute:'right'}, {active:1, hour:'left', minute:'up'}
            ],
            4: [
                {active:1, hour:'up', minute:'down'}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'up', minute:'down'}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'up', minute:'right'}, {active:1, hour:'right', minute:'right'}, {active:1, hour:'up', minute:'left'},
                {active:0}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:0}, {active:0}, {active:1, hour:'up', minute:'down'}
            ],
            5: [
                {active:1, hour:'right', minute:'down'}, {active:1, hour:'left', minute:'right'}, {active:1, hour:'left', minute:'left'},
                {active:1, hour:'up', minute:'down'}, {active:0}, {active:0},
                {active:1, hour:'up', minute:'right'}, {active:1, hour:'right', minute:'left'}, {active:1, hour:'down', minute:'left'},
                {active:0}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'left', minute:'right'}, {active:1, hour:'left', minute:'right'}, {active:1, hour:'left', minute:'up'}
            ],
            6: [
                {active:1, hour:'down', minute:'right'}, {active:1, hour:'left', minute:'right'}, {active:1, hour:'left', minute:'left'},
                {active:1, hour:'up', minute:'down'}, {active:0}, {active:0},
                {active:1, hour:'up', minute:'down'}, {active:1, hour:'left', minute:'right'}, {active:1, hour:'left', minute:'down'},
                {active:1, hour:'up', minute:'down'}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'up', minute:'right'}, {active:1, hour:'left', minute:'right'}, {active:1, hour:'left', minute:'up'}
            ],
            7: [
                {active:1, hour:'left', minute:'right'}, {active:1, hour:'left', minute:'right'}, {active:1, hour:'down', minute:'left'},
                {active:0}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:0}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:0}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:0}, {active:0}, {active:1, hour:'up', minute:'down'}
            ],
            8: [
                {active:1, hour:'down', minute:'right'}, {active:1, hour:'left', minute:'right'}, {active:1, hour:'left', minute:'down'},
                {active:1, hour:'up', minute:'down'}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'up', minute:'right'}, {active:1, hour:'left', minute:'right'}, {active:1, hour:'up', minute:'left'},
                {active:1, hour:'up', minute:'down'}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'up', minute:'right'}, {active:1, hour:'left', minute:'right'}, {active:1, hour:'left', minute:'up'}
            ],
            9: [
                {active:1, hour:'down', minute:'right'}, {active:1, hour:'right', minute:'right'}, {active:1, hour:'left', minute:'down'},
                {active:1, hour:'up', minute:'down'}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'right', minute:'up'}, {active:1, hour:'left', minute:'right'}, {active:1, hour:'up', minute:'down'},
                {active:0}, {active:0}, {active:1, hour:'up', minute:'down'},
                {active:1, hour:'right', minute:'right'}, {active:1, hour:'right', minute:'right'}, {active:1, hour:'left', minute:'up'}
            ]
        };
        return patterns[digit];
    }

    displayTime(time) {
        if (time === this.lastTime) return;
        this.lastTime = time;
        
        const digits = time.replace(/:/g, '').split('');
        
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const digitIndex = Math.floor(col / 3);
                const digitCol = col % 3;
                const digit = parseInt(digits[digitIndex]);
                const pattern = this.getDigitPattern(digit);
                const clockInfo = pattern[row * 3 + digitCol];
                
                const clock = this.clocks.get(`${row}_${col}`);
                clock.active = clockInfo.active;
                
                if (clockInfo.active) {
                    const [hourAngle, minuteAngle] = this.getAngles(clockInfo);
                    clock.setAngles(hourAngle, minuteAngle);
                } else {
                    const randomAngle1 = Math.random() * Math.PI * 2;
                    const randomAngle2 = Math.random() * Math.PI * 2;
                    clock.setAngles(randomAngle1, randomAngle2);
                }
            }
        }
    }

    update() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        this.displayTime(timeString);

        const milliseconds = now.getMilliseconds();
        this.clocks.forEach(clock => clock.update(milliseconds));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        
        const totalWidth = (this.gridWidth * this.spacing) + (2 * this.digitSpacing);
        const totalHeight = this.gridHeight * this.spacing;
        this.ctx.translate(
            (this.canvas.width - totalWidth) / 2,
            (this.canvas.height - totalHeight) / 2
        );
        
        this.clocks.forEach(clock => clock.draw(this.ctx));
        this.ctx.restore();
    }
}

// Initialize and start the animation
const canvas = document.getElementById('clockCanvas');
const display = new DigitalDisplay(canvas);

function animate() {
    display.update();
    display.draw();
    requestAnimationFrame(animate);
}

animate();
