function wholeThing() {
 

    function CanvasState(config) {
        this._balls = new Array();


        // **** First some setup! ****
        this.canvas = config.parentObject;
        this.type = config.type;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.volume = config.startVolume;
        this.pressure = config.startPressure;
        this.volumeMax = config.volumeMax;
        this.volumeMin = config.volumeMin;
        this.volumeX = config.volumeX;
        this.volumeWidth = config.volumeWidth;

        this.volMaxLiter = config.volMaxLiter;
        this.temperature = config.startTemperature;
        this.tempMaxK = config.tempMaxK;
        this.temperMax= config.temperMax;
        this.temperMin = config.temperMin;
        this.speed = 0.5;
        this.particles = new Particles();
        this.particles.init(config._particleConfig);

        if (this.type == 'boyle') {
            this.k = this.volume * this.pressure;
        }
        if (this.type == 'charles') {
            this.k = this.volume / this.temperature;
        }
        if (this.type == 'gaylussac') {
            this.k = this.pressure / this.temperature;
        }

        this.ctx = this.canvas.getContext('2d');
        // This complicates things a little but but fixes mouse co-ordinate problems
        // when there's a border or padding. See getMouse for more detail
        var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
        if (document.defaultView && document.defaultView.getComputedStyle) {
            this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['paddingLeft'], 10) || 0;
            this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['paddingTop'], 10) || 0;
            this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['borderLeftWidth'], 10) || 0;
            this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['borderTopWidth'], 10) || 0;
        }
        // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
        // They will mess up mouse coordinates and this fixes that
        var html = document.body.parentNode;
        this.htmlTop = html.offsetTop;
        this.htmlLeft = html.offsetLeft;


        this._balls = [
            { dx: 4, dy: 4, r: 3, y: config._particleConfig.y + 10, x: config._particleConfig.x + 30, color: "#0000ff", mass: 1 },
            { dx: 4, dy: 4, r: 3, y: config._particleConfig.y + 100, x: config._particleConfig.x + 100, color: "#00ff00", mass: 1 },
            { dx: 3, dy: 5, r: 3, y: config._particleConfig.y + 50, x: config._particleConfig.x + 50, color: "#00ffff", mass: 1 },
            { dx: 4, dy: 4, r: 3, y: config._particleConfig.y + 45, x: config._particleConfig.x + 30, color: "#ffff00", mass: 1 },
            { dx: 7, dy: 1, r: 3, y: config._particleConfig.y + 75, x: config._particleConfig.x + 55, color: "#ff00ff", mass: 1 },
            { dx: 4, dy: 4, r: 3, y: config._particleConfig.y + 90, x: config._particleConfig.x + 90, color: "#00ff00", mass: 1 },
            { dx: 3, dy: 5, r: 3, y: config._particleConfig.y + 0, x: config._particleConfig.x + 50, color: "#00ffff", mass: 1 },
            { dx: 4, dy: 4, r: 3, y: config._particleConfig.y + 45, x: config._particleConfig.x + 0, color: "#ffff00", mass: 1 },
            { dx: 7, dy: 1, r: 3, y: config._particleConfig.y + 105, x: config._particleConfig.x + 80, color: "#ff00ff", mass: 1 },
            { dx: 7, dy: 1, r: 3, y: config._particleConfig.y + 5, x: config._particleConfig.x + 20, color: "#ff00ff", mass: 1 }
        ];



      
        this.valid = false; // when set to false, the canvas will redraw everything

        this.volShape = new Shape();
        this.temperShape = new Shape();
        this.needle1 = new Image();
        this.needle1.src = "image/needle.png";
        this.needle1.X = config.needle1X;
        this.needle1.Y = config.needle1Y;


        this.volDragging = false; // Keep track of when we are dragging the volume
        this.temperDragging = false; // Keep track of when we are dragging the temperature
        this.dragoffx = 0; // See mousedown and mousemove events for explanation
        this.dragoffy = 0;

        // **** Then events! ****
        var myState = this;

        //fixes a problem where double clicking causes text to get selected on the canvas
        this.canvas.addEventListener('selectstart', function (e) { e.preventDefault(); return false; }, false);
        // Up, down, and move are for dragging
        this.canvas.addEventListener('mousedown', function (e) {
            _mouseDown(e);         
        }, true);
        this.canvas.addEventListener('touchstart', function (e) {
            _mouseDown(e);       
        }, true);
        this.canvas.addEventListener('mousemove', function (e) {
            _mouseMove(e);    
        }, true);
        this.canvas.addEventListener('touchmove', function (e) {
            _mouseMove(e);   
        }, true);
        this.canvas.addEventListener('mouseup', function (e) {
            _mouseUp(e);
        }, true);
        this.canvas.addEventListener('touchend', function (e) {
            _mouseUp(e);
        }, true);

        function _mouseDown(e) {
            //Start dragging if the mouse is in the volShape
            var mouse = myState.getMouse(e);
            var mx = mouse.x;
            var my = mouse.y;

            //See if we're dragging the volume
            if (myState.type == 'boyle') {
                if (myState.volShape.contains(mx, my)) {
                    myState.dragoffx = mx - myState.volShape.x;
                    myState.dragoffy = my - myState.volShape.y;
                    myState.volDragging = true;
                    myState.temperDragging = false;
                    myState.valid = false;
                    return;
                }
            }
            //See if we're dragging the temperature
            if (myState.type == 'charles' || myState.type == 'gaylussac') {
                if (myState.temperShape.contains(mx, my)) {
                    myState.dragoffx = mx - myState.temperShape.x;
                    myState.dragoffy = my - myState.temperShape.y;
                    myState.temperDragging = true;
                    myState.volDragging = false;
                    myState.valid = false;
                    return;
                }
            }

        }
        function _mouseMove(e) {
            if (myState.volDragging) {
                var mouse = myState.getMouse(e);
                // We don't want to drag the object by its top-left corner, we want to drag it
                // from where we clicked. Thats why we saved the offset and use it here
                myState.volShape.y = mouse.y - myState.dragoffy;

                if (myState.volShape.y < myState.volumeMin) {
                    myState.volShape.y = myState.volumeMin;
                }
                if (myState.volShape.y > myState.volumeMax - 30) {
                    myState.volShape.y = myState.volumeMax - 30;
                }

                //The max volume is 45.0L
                
                myState.volume = ((myState.volumeMax - myState.volShape.y + myState.volShape.h) / myState.volumeMax) * myState.volMaxLiter;

                //Math specific to Boyle's Law
                myState.pressure = myState.k / myState.volume;

                myState.valid = false; // Something's dragging so we must redraw
            }

            if (myState.temperDragging) {
                var mouse = myState.getMouse(e);
                // We don't want to drag the object by its top-left corner, we want to drag it
                // from where we clicked. Thats why we saved the offset and use it here
                myState.temperShape.y = mouse.y - myState.dragoffy;

                if (myState.temperShape.y < myState.temperMin) {
                    myState.temperShape.y = myState.temperMin;
                }
                if (myState.temperShape.y > myState.temperMax) {
                    myState.temperShape.y = myState.temperMax;
                }

                //Get the total pixels in the thermometer
                var _totalTemp = myState.temperMax - myState.temperMin;
                //Find the number of pixels past the min, and divide by the total
                var _tPct = (myState.temperMax - myState.temperShape.y) / _totalTemp;
                //Now take the total temperature gap (400k - 200k) and mutiply it by the percent, and add the min temperature (200k)
                myState.temperature = 200 * _tPct + 200;

                //Math specific to Charles' Law
                if (myState.type == 'charles') {
                    myState.volume = myState.k * myState.temperature;
                    //Adjust the volume based on the temperature
                    myState.volShape.y = (((myState.volMaxLiter - myState.volume) / config.volMaxLiter) * config.volumeMax) + myState.volShape.h;
                }
                //Math specific to Gay-Lussac's Law'
                else {
                    myState.pressure = myState.k * myState.temperature;
                }

                if (myState.type == "charles" || myState.type == "gaylussac") {
                    //Get the pct to adjust speed
                    var _pctTemp = (myState.temperature - 175) / (myState.tempMaxK - 175);
                    myState.speed = _pctTemp * 1.5;
                }


                myState.valid = false; // Something's dragging so we must redraw
            }
        }
        function _mouseUp(e) {
            //if (myState.particles) {
            //    updateCollisionArea(myState);
            //}
            myState.volDragging = false;
            myState.temperDragging = false;
            myState.valid = false;
        }

        this.selectionColor = '#CC0000';
        this.selectionWidth = 2;
        this.interval = 30;
        setInterval(function () { myState.draw(); }, myState.interval);
    }

    CanvasState.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    // While draw is called as often as the INTERVAL variable demands,
    // It only ever does something if the canvas gets invalidated by our code
    CanvasState.prototype.draw = function () {
        // if our state is invalid, redraw and validate!
        var ctx = this.ctx;
        if (!this.valid) {
            this.clear();          

            var _maxPressure = 4.5; //atm
            if (this.type == 'gaylussac') {
                _maxPressure = 2.0; //atm
            }
            if (this.needle1 && this.needle1.src) {
                ctx.translate(this.needle1.X, this.needle1.Y); // change origin
                var _pct = (_maxPressure - this.pressure) / _maxPressure;
                var _angleInRadians = (Math.PI / 4 - (Math.PI / 2 * _pct)) ;
                ctx.rotate(_angleInRadians); //rotate the whole context
                ctx.drawImage(this.needle1, -this.needle1.width / 2, -this.needle1.height);
                ctx.rotate(-_angleInRadians); //rotate it back
                ctx.translate(-this.needle1.X, -this.needle1.Y); // change origin back
            }
           

            this.volShape.draw(ctx);
            this.temperShape.draw(ctx);

            ctx.font = "bold 10pt sans";
            ctx.fillStyle = "black";
            ctx.fillText(this.volume.toFixed(2) + " L", (ctx.canvas.width / 2) - 20, 20);
            ctx.fillText(this.pressure.toFixed(2) + " atm", (ctx.canvas.width / 8) - 20, 35 );
            ctx.fillText(this.temperature.toFixed(2) + " K", ((ctx.canvas.width / 8) * 7) - 30, 35);

            //If we're dragging the volume, make it red
            if (this.volDragging) {
                ctx.strokeStyle = this.selectionColor;
                ctx.lineWidth = this.selectionWidth;
                var mySel = this.volShape;
                ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
            }
            //If we're dragging the temperature, make it red
            if (this.temperDragging) {
                ctx.strokeStyle = this.selectionColor;
                ctx.lineWidth = this.selectionWidth;
                var mySel = this.temperShape;
                ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
            }

            this.valid = true;
        }
        else {
            if (this.particles) {
                var _cfg = {};
                _cfg.x = this.volShape.x;
                _cfg.y = this.volShape.y + this.volShape.h;
                _cfg.width = this.volShape.w;
                _cfg.height = this.volumeMax - this.volShape.y;
                _cfg.speed = this.speed;
                _cfg.context = ctx;
                this.particles.draw(_cfg, this._balls);
            }

        }
    }


    // Creates an object with x and y defined, set to the mouse position relative to the state's canvas
    // If you wanna be super-correct this can be tricky, we have to worry about padding and borders
    CanvasState.prototype.getMouse = function (e) {
        var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

        // Compute the total offset
        if (element.offsetParent !== undefined) {
            do {
                offsetX += element.offsetLeft;
                offsetY += element.offsetTop;
            } while ((element = element.offsetParent));
        }

        // Add padding and border style widths to offset
        // Also add the <html> offsets in case there's a position:fixed bar
        offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
        offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

        //Handle mouse (PC) or touch (mobile)
        if (e.pageX) {
            mx = e.pageX - offsetX;
            my = e.pageY - offsetY;
        }
        else {
            if (e.touches && e.touches.length == 1) {
                mx = e.touches[0].pageX - offsetX;
                my = e.touches[0].pageY - offsetY;
            }
        }

        // We return a simple javascript object (a hash) with x and y defined
        return { x: mx, y: my };
    }

    wholeThing.prototype.init = function(config) {
        var s = new CanvasState(config);
       
        //Set the volShape
        //Take 100L minus the start volume times the 100L to get a percent of the original
        var _vPct = (config.volMaxLiter - config.startVolume) / config.volMaxLiter;
        //var _vol = ((config.volMaxLiter - config.startVolume) / config.volMaxLiter) * config.volumeMax;
        var _vol = config.volumeMax * _vPct;
        var _color = config.type == 'boyle' ? '#aa00ff' : '#444444';
        s.volShape = new Shape(config.volumeX, config.volumeMax -_vol + 20, config.volumeWidth, 20, _color);

        //Set the temperShape
        //Take the high temperature (400k) and subtract the start temperature, then divide by the total gap (400k - 200k)
        var _tPct = (config.tempMaxK - config.startTemperature) / 200;
        var _tGap = (config.temperMax - config.temperMin) * _tPct;
        var _colorT = (config.type == 'charles' || config.type == 'gaylussac') ? '#aa00ff' : '#444444';
        s.temperShape = new Shape(config.temperX, config.temperMin + _tGap , config.temperWidth, 20, _colorT);

        //updateCollisionArea(s);
        s.valid = false;
    }

    function Shape(x, y, w, h, fill) {
        // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
        // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
        // But we aren't checking anything else! We could put "Lalala" for the value of x 
        this.x = x || 0;
        this.y = y || 0;
        this.w = w || 1;
        this.h = h || 1;
        this.fill = fill || '#AAAAAA';
    }

    // Draws this shape to a given context
    Shape.prototype.draw = function (ctx) {
        ctx.fillStyle = this.fill;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    // Determine if a point is inside the shape's bounds
    Shape.prototype.contains = function (mx, my) {
        // All we have to do is make sure the Mouse X,Y fall in the area between
        // the shape's X and (X + Width) and its Y and (Y + Height)
        return (this.x <= mx) && (this.x + this.w >= mx) &&
                (this.y <= my) && (this.y + this.h >= my);
    }
  

};
