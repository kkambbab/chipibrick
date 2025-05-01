const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");

        class Ball {
            constructor(x, y, dx, dy, radius = 8) {
                this.x = x;
                this.y = y;
                this.dx = dx;
                this.dy = dy;
                this.radius = radius;
            }
            move() {
                this.x += this.dx;
                this.y += this.dy;
            }
            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }

        class Item {
            constructor(x, y, type) {
                this.x = x;
                this.y = y;
                this.radius = 10;
                this.type = type;
                this.dy = 2;
            }
            move() {
                this.y += this.dy;
            }
            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = "#FFA500";
                ctx.fill();
                ctx.closePath();
                ctx.font = "10px Arial";
                ctx.fillStyle = "#000";
                ctx.textAlign = "center";
                ctx.fillText(this.type, this.x, this.y + 3);
            }
        }

        let balls = [new Ball(canvas.width / 2, canvas.height - 30, 4, -4)];
        let items = [];
        let paddleHeight = 10;
        let paddleWidth = 75;
        let paddleX = (canvas.width - paddleWidth) / 2;

        let brickRowCount = 5;
        let brickColumnCount = 10;
        let brickWidth = 60;
        let brickHeight = 16;
        let brickPadding = 10;
        let brickOffsetTop = 10;
        let brickOffsetLeft = 15;

        let score = 0;
        let bricks = [];

        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }

        document.addEventListener("mousemove", e => {
            const relativeX = e.clientX - canvas.getBoundingClientRect().left;
            if (relativeX > 0 && relativeX < canvas.width) {
                paddleX = relativeX - paddleWidth / 2;
            }
        });

        const videoA = document.getElementById("videoA");
        const videoB = document.getElementById("videoB");
        const volumeSlider = document.getElementById("volumeSlider");

        videoA.muted = false;
        videoB.muted = true;
        videoA.play().catch(() => { });

        volumeSlider.addEventListener("input", () => {
            const vol = parseFloat(volumeSlider.value);
            videoA.volume = vol;
            videoB.volume = vol;
        });
        videoA.volume = videoB.volume = volumeSlider.value;

        function reactionTrigger() {
            videoB.style.opacity = 1;
            videoA.muted = true;
            videoB.muted = false;
            if (window._videoTimeout) clearTimeout(window._videoTimeout);
            window._videoTimeout = setTimeout(() => {
                videoB.style.opacity = 0;
                videoA.muted = false;
                videoB.muted = true;
                videoA.play().catch(() => { });
            }, 400);
        }

        function collisionDetection() {
            balls.forEach(ball => {
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 0; r < brickRowCount; r++) {
                        const b = bricks[c][r];
                        if (b.status === 1) {
                            if (
                                ball.x + ball.radius > b.x &&
                                ball.x - ball.radius < b.x + brickWidth &&
                                ball.y + ball.radius > b.y &&
                                ball.y - ball.radius < b.y + brickHeight
                            ) {
                                ball.dy = -ball.dy;
                                b.status = 0;
                                score++;
                                reactionTrigger();
                                if (score === brickRowCount * brickColumnCount) {
                                    setTimeout(() => {
                                        alert("치피치피차파차파두비두비다바다바 매지컬 마이 두비두비 붐붐붐치피치피차파차파두비두비다바다바 매지컬 마이 두비두비 붐붐붐치피치피차파차파두비두비다바다바 매지컬 마이 두비두비 붐붐붐치피치피차파차파두비두비다바다바 매지컬 마이 두비두비 붐붐붐치피치피차파차파두비두비다바다바 매지컬 마이 두비두비 붐붐붐치피치피차파차파두비두비다바다바 매지컬 마이 두비두비 붐붐붐치피치피차파차파두비두비다바다바 매지컬 마이 두비두비 붐붐붐치피치피차파차파두비두비다바다바 매지컬 마이 두비두비 붐붐붐치피치피차파차파두비두비다바다바 매지컬 마이 두비두비 붐붐붐치피치피차파차파두비두비다바다바 매지컬 마이 두비두비 붐붐붐");
                                        document.location.reload();
                                    }, 100);
                                }

                                if (Math.random() < 0.3) {
                                    const types = ["+3", "x3", "<<->>", "-"];
                                    const randomType = types[Math.floor(Math.random() * types.length)];
                                    items.push(new Item(b.x + brickWidth / 2, b.y + brickHeight / 2, randomType));
                                }
                            }
                        }
                    }
                }
            });
        }

        function applyItemEffect(type) {
            switch (type) {
                case "+3":
                    for (let i = 0; i < 3; i++) {
                        balls.push(new Ball(paddleX + paddleWidth / 2, canvas.height - 20, (Math.random() - 0.5) * 4, -4));
                    }
                    break;
                case "x3":
                    let newBalls = [];
                    balls.forEach(b => {
                        for (let i = 0; i < 2; i++) {
                            newBalls.push(new Ball(b.x, b.y, -b.dx + Math.random(), -b.dy + Math.random()));
                        }
                    });
                    balls = balls.concat(newBalls);
                    break;
                case "<<->>":
                    paddleWidth += 20;
                    if (paddleWidth > canvas.width) paddleWidth = canvas.width - 10;
                    break;
                case "-":
                    paddleWidth -= 20;
                    if (paddleWidth < 30) paddleWidth = 30;
                    break;
            }
        }

        function checkItemCollisions() {
            items = items.filter(item => {
                if (
                    item.y + item.radius > canvas.height - paddleHeight &&
                    item.x > paddleX &&
                    item.x < paddleX + paddleWidth
                ) {
                    applyItemEffect(item.type);
                    return false;
                }
                return item.y < canvas.height;
            });
        }

        function drawBricks() {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    if (bricks[c][r].status === 1) {
                        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                        bricks[c][r].x = brickX;
                        bricks[c][r].y = brickY;
                        ctx.beginPath();
                        ctx.rect(brickX, brickY, brickWidth, brickHeight);
                        ctx.fillStyle = "#FF5733";
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        }

        function drawPaddle() {
            ctx.beginPath();
            ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
        }

        function drawScore() {
            ctx.font = "16px Arial";
            ctx.fillStyle = "#000";
            ctx.fillText("점수: " + score, 8, 20);
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBricks();
            balls.forEach(ball => ball.draw(ctx));
            drawPaddle();
            drawScore();
            items.forEach(item => item.draw(ctx));
            collisionDetection();
            checkItemCollisions();

            balls.forEach(ball => {
                if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) ball.dx = -ball.dx;
                if (ball.y + ball.dy < ball.radius) ball.dy = -ball.dy;
                else if (ball.y + ball.dy > canvas.height - ball.radius) {
                    if (ball.x + ball.radius > paddleX && ball.x - ball.radius < paddleX + paddleWidth) {
                        let paddleCenter = paddleX + paddleWidth / 2;
                        let hitPos = (ball.x - paddleCenter) / (paddleWidth / 2);
                        let angle = hitPos * (Math.PI / 3);
                        let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                        ball.dx = speed * Math.sin(angle);
                        ball.dy = -speed * Math.cos(angle);
                    } else {
                        balls = balls.filter(b => b !== ball);
                    }
                }
                ball.move();
            });

            items.forEach(item => item.move());

            if (balls.length === 0) {
                alert("우르르...애옭....우르르르르.....애록.....울,르ㅡ르릉 애록...애옭,,,,,앩,,,,우륵....앩...");
                document.location.reload();
            }

            requestAnimationFrame(draw);
        }

        draw();

        document.addEventListener("click", () => {
            if (videoA.paused) {
                videoA.play().catch(() => { });
            }
        }, { once: true });