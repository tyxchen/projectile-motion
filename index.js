(function () {
    'use strict';

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    var ACCEL_GRAVITY = 39.24; // 4 * 9.81;
    var CLIFF_HEIGHT = 300;
    var FLOOR_HEIGHT = 400;

    var ball = {
        x: 20,
        y: CLIFF_HEIGHT - 20,
        vi: 0,
        theta: 0,
        motionStartTimestamp: 0
    };

    var arrow = {
        x: 40,
        y: CLIFF_HEIGHT - 20
    };

    var isAnimating = false;

    ctx.font = "12px Arial";

    var calcPosition = function (timestamp) {
        var vy = ball.vi * Math.sin(ball.theta),
            vx = ball.vi * Math.cos(ball.theta),
            dt = (timestamp - ball.motionStartTimestamp) / 1000;

        return {
            x: ball.x + 4 * vx * dt,
            y: ball.y + 4 * (vy * dt +
                0.5 * ACCEL_GRAVITY * dt * dt),
            v: Math.sqrt(vx * vx + vy * vy)
        };
    };

    var draw = function () {

        var path = new Path2D(),
            ballPath = new Path2D(),
            arrowPath = new Path2D();

        var ballPos = calcPosition(isAnimating ? Date.now() : 0);

        console.log(ballPos.x, ballPos.y, ballPos.v);

        path.moveTo(0, CLIFF_HEIGHT);
        path.lineTo(40, CLIFF_HEIGHT);
        path.lineTo(40, FLOOR_HEIGHT);
        path.lineTo(canvas.width, FLOOR_HEIGHT);

        path.moveTo(12, CLIFF_HEIGHT);
        path.lineTo(12, CLIFF_HEIGHT - 20);
        path.arc(20, CLIFF_HEIGHT - 20, 8, Math.PI, 0.1, false);
        path.moveTo(28, CLIFF_HEIGHT - 20);
        path.lineTo(28, CLIFF_HEIGHT);

        arrowPath.moveTo(ballPos.x, ballPos.y);
        arrowPath.lineTo(arrow.x, arrow.y);

        ballPath.moveTo(ballPos.x, ballPos.y);
        ballPath.arc(ballPos.x, ballPos.y, 4, 0, 2 * Math.PI, true);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.stroke(path);
        ctx.fill(ballPath);

        if (!isAnimating && ballPos.y == ball.y) {
            ctx.stroke(arrowPath);
            ctx.fillText(
                Math.round(ball.vi * 1e5) / 1e5 + ' m/s',
                arrow.x,
                arrow.y
            );
            ctx.fillText(
                'θ = ' + (-Math.round(ball.theta * 1e5) / 1e5),
                arrow.x,
                arrow.y + 12
            );
        }

        if (isAnimating && ballPos.y + 4 < FLOOR_HEIGHT) {
            requestAnimationFrame(draw);
        } else {
            isAnimating = false;
            ball.motionStartTimestamp = 0;
        }
    };

    var fire = function () {
        isAnimating = true;
        ball.motionStartTimestamp = Date.now();

        console.log(ball.vi, ball.theta);

        draw();
    };

    canvas.addEventListener('mousedown', function() {
        if (!isAnimating) {
            fire();
        } else {
            isAnimating = false;
            ball.motionStartTimestamp = 0;
        }
    }, false);

    canvas.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();

        if (!isAnimating) {
            arrow.x = e.clientX - rect.left;
            arrow.y = e.clientY - rect.top;

            // velocity = magnitude of vector from mouse to ball
            ball.vi = Math.sqrt(Math.pow(arrow.x - ball.x, 2) +
                Math.pow(arrow.y - ball.y, 2)) / 5;

            // angle = angle of said vector
            ball.theta = Math.atan2(arrow.y - ball.y, arrow.x - ball.x);

            draw();
        }
    }, false);

    draw(0);
})();
