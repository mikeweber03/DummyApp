function Particles () {
  
    //var _balls;
    
    Particles.prototype.init = function (config) {
        //_balls = new Array();

        //_balls = [{ dx: 4, dy: 4, r: 3, y: config.y + 10, x: config.x + 30, color: "#0000ff", mass: 1 },
        //            { dx: 4, dy: 4, r: 3, y: config.y + 100, x: config.x + 100, color: "#00ff00", mass: 1 },
        //            { dx: 3, dy: 5, r: 3, y: config.y + 50, x: config.x + 50, color: "#00ffff", mass: 1 },
        //            { dx: 4, dy: 4, r: 3, y: config.y + 45, x: config.x + 30, color: "#ffff00", mass: 1 },
        //            { dx: 7, dy: 1, r: 3, y: config.y + 75, x: config.x + 55, color: "#ff00ff", mass: 1 },
        //            { dx: 4, dy: 4, r: 3, y: config.y + 90, x: config.x + 90, color: "#00ff00", mass: 1 },
        //            { dx: 3, dy: 5, r: 3, y: config.y + 0, x: config.x + 50, color: "#00ffff", mass: 1 },
        //            { dx: 4, dy: 4, r: 3, y: config.y + 45, x: config.x + 0, color: "#ffff00", mass: 1 },
        //            { dx: 7, dy: 1, r: 3, y: config.y + 105, x: config.x + 80, color: "#ff00ff", mass: 1 },
        //            { dx: 7, dy: 1, r: 3, y: config.y + 5, x: config.x + 20, color: "#ff00ff", mass: 1 }
        //];
    }

    //Particles.prototype.update = function (config) {
    //    width = config.width;
    //    height = config.height;
    //    x = config.x;
    //    y = config.y;
    //    speed = config.speed;
    //}
  
    Particles.prototype.draw = function (cfg, balls) {
        cfg.context.clearRect(cfg.x, cfg.y, cfg.width, cfg.height);

        //var balls = this.getBalls();

        for (var i = 0; i < balls.length; i++) {
            updatePosition(balls[i], cfg);
        }

        for (var a = 0; a < balls.length; a++) {
            for (var b = 0; b < balls.length; b++) {
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

        cfg.context.beginPath();
        cfg.context.fillStyle = "#000000";
        cfg.context.arc(ball.x, ball.y, 2, 0, Math.PI * 2, true);
        cfg.context.closePath();
        cfg.context.fill();

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
