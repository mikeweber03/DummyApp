function Particles () {
    
    Particles.prototype.init = function (config) {
    }

    Particles.prototype.draw = function (cfg, balls, ballLength) {
        cfg.context.clearRect(cfg.x, cfg.y, cfg.width, cfg.height);
        for (var i = 0; i < ballLength; i++) {
            updatePosition(balls[i], cfg);
        }

        for (var a = 0; a < ballLength; a++) {
            for (var b = 0; b < ballLength; b++) {
                if (a != b) {
                    checkCollisionOuter(balls[a], balls[b]);
                }
            }
        }
    }

    function updatePosition(ball, cfg) {
        if (ball.x + ball.dx * cfg.speed - ball.r < cfg.x) {
                ball.x = cfg.x + ball.r;
                if (ball.dx < 0) {
                    ball.dx = -ball.dx;
            }
        }
        else {
            if (ball.x + ball.dx * cfg.speed + ball.r > cfg.width + cfg.x) {
                ball.x = cfg.x + cfg.width - ball.r;
                ball.dx = -ball.dx;
            }
        }

        //Y
            if (ball.y + ball.dy * cfg.speed - ball.r < cfg.y) {
                ball.y = cfg.y + ball.r;
                if (ball.dy < 0) {
                    ball.dy = -ball.dy;
            }
        }
        else {
            if (ball.y + ball.dy * cfg.speed + ball.r > cfg.height + cfg.y) {
                ball.y = cfg.y + cfg.height - ball.r;
                ball.dy = -ball.dy;
            }
        }

        ball.x += ball.dx * cfg.speed;
        ball.y += ball.dy * cfg.speed;
        cfg.context.beginPath();
        cfg.context.fillStyle = ball.color;
        cfg.context.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2, true);
        cfg.context.closePath();
        cfg.context.fill();

        //cfg.context.beginPath();
        //cfg.context.fillStyle = "#000000";
        //cfg.context.arc(ball.x, ball.y, 2, 0, Math.PI * 2, true);
        //cfg.context.closePath();
        //cfg.context.fill();

    }

    function checkCollisionOuter(firstBall, secondBall) {
        if (firstBall.x + firstBall.r + secondBall.r > secondBall.x && firstBall.x < secondBall.x + firstBall.r + secondBall.r
                && firstBall.y + firstBall.r + secondBall.r > secondBall.y && firstBall.y < secondBall.y + firstBall.r + secondBall.r) {
           
            //AABBs are overlapping- look closer!
            checkCollisionInner(firstBall, secondBall);
        }
    }

    function checkCollisionInner(firstBall, secondBall) {
        distance = Math.sqrt(((firstBall.x - secondBall.x) * (firstBall.x - secondBall.x)) + ((firstBall.y - secondBall.y) * (firstBall.y - secondBall.y)) );
        if (distance < firstBall.r + secondBall.r)
        {
            adjustVelocity(firstBall, secondBall);
        }
    }  

    function adjustVelocity(firstBall, secondBall) {
        //first guy's
        var velX1 = (firstBall.dx * (firstBall.mass - secondBall.mass) + (2 * secondBall.mass * secondBall.dx)) / (firstBall.mass + secondBall.mass);
        var velY1 = (firstBall.dy * (firstBall.mass - secondBall.mass) + (2 * secondBall.mass * secondBall.dy)) / (firstBall.mass + secondBall.mass);
        var velX2 = (secondBall.dx * (secondBall.mass - firstBall.mass) + (2 * firstBall.mass * firstBall.dx)) / (firstBall.mass + secondBall.mass);
        var velY2 = (secondBall.dy * (secondBall.mass - firstBall.mass) + (2 * firstBall.mass * firstBall.dy)) / (firstBall.mass + secondBall.mass);
      
        firstBall.dx = velX1;
        secondBall.dx = velX2;
        firstBall.dy = velY1;
        secondBall.dy = velY2;

        firstBall.x = firstBall.x + velX1;
        firstBall.y = firstBall.y + velY1;
        secondBall.x = secondBall.x + velX2;
        secondBall.y = secondBall.y + velY2;
    }
}
