class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.startBtn = document.getElementById('start-btn');
        
        // Set canvas size
        this.canvas.width = 600;
        this.canvas.height = 400;
        
        // Game settings
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [];
        this.food = { x: 0, y: 0 };
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameSpeed = 100;
        this.isGameOver = false;
        this.isPlaying = false;
        
        // Particle system for effects
        this.particles = [];
        
        // Initialize event listeners
        this.initEventListeners();
    }
    initEventListeners() {
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        this.startBtn.addEventListener('click', this.handleStartClick.bind(this));
    }
    
    handleKeydown(event) {
        const keyMap = {
            'ArrowUp': 'up', 'w': 'up',
            'ArrowDown': 'down', 's': 'down',
            'ArrowLeft': 'left', 'a': 'left',
            'ArrowRight': 'right', 'd': 'right'
        };
    
        const oppositeDirections = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
    
        const newDirection = keyMap[event.key];
    
        if (newDirection && this.direction !== oppositeDirections[newDirection]) {
            this.nextDirection = newDirection;
        }
    }
    
    handleStartClick() {
        if (!this.isPlaying) {
            this.startGame();
        }
    }
    
    
    startGame() {
        // Reset game state
        this.snake = [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 3, y: 5 }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.scoreElement.textContent = `Score: ${this.score}`;
        this.isGameOver = false;
        this.isPlaying = true;
        this.startBtn.textContent = 'Restart Game';
        
        // Generate initial food
        this.generateFood();
        
        // Start game loop
        this.gameLoop();
    }
    
    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
        };
        
        // Make sure food doesn't spawn on snake
        for (let segment of this.snake) {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                this.generateFood();
                return;
            }
        }
    }
    
    createParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x * this.gridSize + this.gridSize / 2,
                y: y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    drawParticles() {
        this.ctx.save();
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }
    
    update() {
        if (this.isGameOver) return;
        
        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };
        
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Check for collisions
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.canvas.height / this.gridSize ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = `Score: ${this.score}`;
            this.createParticles(this.food.x, this.food.y);
            this.generateFood();
        } else {
            this.snake.pop();
        }
        
        this.updateParticles();
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createLinearGradient(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                (segment.x + 1) * this.gridSize,
                (segment.y + 1) * this.gridSize
            );
            
            if (index === 0) {
                gradient.addColorStop(0, '#4CAF50');
                gradient.addColorStop(1, '#45a049');
            } else {
                gradient.addColorStop(0, '#66bb6a');
                gradient.addColorStop(1, '#4CAF50');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // Draw food
        this.ctx.fillStyle = '#ff5252';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw particles
        this.drawParticles();
        
        // Draw game over message
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
    
    gameOver() {
        this.isGameOver = true;
        this.isPlaying = false;
        this.startBtn.textContent = 'Play Again';
    }
    
    gameLoop() {
        if (!this.isPlaying) return;
        
        this.update();
        this.draw();
        
        setTimeout(() => requestAnimationFrame(() => this.gameLoop()), this.gameSpeed);
    }
}

// Initialize the game when the page loads
window.onload = () => {
    new SnakeGame();
}; 