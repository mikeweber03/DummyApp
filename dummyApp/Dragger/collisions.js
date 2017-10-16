mwApp = {}

mwApp.collisions = (function () {
    var context;
    var width;
    var height;
    var x;
    var y;
    //var container;

    var balls = [];
    
    function init(config) {

        context = config.context;
        width = config.width;
        height = config.height;
        x = config.x;
        y = config.y;

        //container = document.getElementById("can1");
        //context = container.getContext('2d');

        balls = [   {dx: 4, dy: 4, r: 3, y: y + 10, x: x + 30, color: "#0000ff", mass:1},
                    {dx: 4, dy: 4, r: 3, y: y + 100, x: x + 100,color: "#00ff00", mass:1},
                    { dx: 3, dy: 5, r: 3, y: y + 50, x: x + 50, color: "#00ffff", mass: 1 },
                    { dx: 4, dy: 4, r: 3, y: y + 45, x: x+30, color: "#ffff00", mass: 1 },
                    { dx: 7, dy: 1, r: 3, y: y +75, x: x+55, color: "#ff00ff", mass: 1 },
                    { dx: 4, dy: 4, r: 3, y: y + 90, x: x + 90, color: "#00ff00", mass: 1 },
                    { dx: 3, dy: 5, r: 3, y: y + 0, x: x + 50, color: "#00ffff", mass: 1 },
                    { dx: 4, dy: 4, r: 3, y: y + 45, x: x + 0, color: "#ffff00", mass: 1 },
                    { dx: 7, dy: 1, r: 3, y: y + 105, x: x + 80, color: "#ff00ff", mass: 1 },
                    { dx: 7, dy: 1, r: 3, y: y + 5, x: x + 20, color: "#ff00ff", mass: 1 }
        ];

       // setInterval(draw, 100);
    }

    function update(config) {
        width = config.width;
        height = config.height;
        x = config.x;
        y = config.y;
        for (var i = 0; i < balls.length; i++) {
            balls[i].dx = config.velocity;
            balls[i].dy = config.velocity;
        }
    }

 
    function draw() {
        context.clearRect(x, y, width, height);

        for (var i = 0; i < balls.length; i++) {
            updatePosition(balls[i]);
        }

        for (var a = 0; a < balls.length; a++) {
            for (var b = 0; b < balls.length; b++) {
                if (a != b) {
                    checkCollisionOuter(balls[a], balls[b]);
                }
            }
        }
    }

    function updatePosition(ball) {
        //if (ball.x - ball.r / 2 < x || ball.x + ball.r/2 > width + x)
        //    ball.dx = -ball.dx;
        //if (ball.y - ball.r/2 < y || ball.y + ball.r/2 > height + y)
        //    ball.dy = -ball.dy;

        //X
        if (ball.dx < 0) {
            if (ball.x + ball.dx - ball.r < x) {
                ball.x = x + ball.r;
                ball.dx = -ball.dx;
            }
        }
        else {
            if (ball.x + ball.dx + ball.r > width + x) {
                ball.x = x + width - ball.r ;
                ball.dx = -ball.dx;
            }
        }

        //Y
        if (ball.dy < 0) {
            if (ball.y + ball.dy - ball.r < y) {
                ball.y = y + ball.r;
                ball.dy = -ball.dy;
            }
        }
        else {
            if (ball.y + ball.dy + ball.r > height + y) {
                ball.y = y + height - ball.r;
                ball.dy = -ball.dy;
            }
        }

        ball.x += ball.dx;
        ball.y += ball.dy;
        context.beginPath();
        context.fillStyle = ball.color;
        context.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();

        context.beginPath();
        context.fillStyle = "#000000";
        context.arc(ball.x, ball.y, 2, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();

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
    
    return {
        init: init,
        update:update,
        draw: draw
    };
})();
