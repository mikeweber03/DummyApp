function wholeThing() {
 

    function CanvasState(config) {
        this._balls = new Array();

        // **** First some setup! ****
        this.canvas = config.parentObject;
        this.ctx = this.canvas.getContext('2d');

        this.type = config.type;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // ******These are set by the background picture
        this.volumeX = 83;
        this.volumeWidth = 131;
        this.volumeMax = 200;
        this.volumeMin = 0;
        this.temperX = 246;
        this.temperWidth = 14;
        this.needle1X = 43;
        this.needle1Y = 120;
        this.temperMax = 155;
        this.temperMin = 65;
        this.speed = 0.5;
        //particle limits
        var _cfg = {};
        _cfg.context = this.ctx;
        _cfg.width = 131;
        _cfg.height = 100;
        _cfg.x = 83;
        _cfg.y = 100;
        _cfg.speed = 0.5;

      
        this.moleSliderId = config.moleSliderId;
        this.volume = config.startVolume;
        this.pressure = config.startPressure;
        this.temperature = config.startTemperature;

        this.volMaxLiter = config.volMaxLiter;
        this.tempMaxK = config.tempMaxK;
        this.maxPressure = config.maxPressure;

        this.particles = new Particles();
        this._particleConfig = _cfg;
        this.particles.init(_cfg);
        //this.particles.init(this._particleConfig);

        if (this.type == 'boyle') {
            this.k = this.volume * this.pressure;
        }
        if (this.type == 'charles') {
            this.k = this.volume / this.temperature;
        }
        if (this.type == 'gaylussac') {
            this.k = this.pressure / this.temperature;
        }
        if (this.type == "combo") {
            this.k = this.volume * this.pressure / this.temperature;
        }
        if (this.type == 'avagadro') {
            //We'll multiply this by changed mole numbers
            this.k = this.pressure ;
        }
       


        //Set the volShape
        var _vPct = (this.volMaxLiter - this.volume) / this.volMaxLiter;
        //var _vol = ((this.volMaxLiter - this.startVolume) / this.volMaxLiter) * this.volumeMax;
        var _vol = this.volumeMax * _vPct;
        var _color = (this.type == 'boyle' || this.type == 'combo' || this.type == 'ideal') ? '#aa00ff' : '#444444';
        this.volShape = new Shape(this.volumeX, this.volumeMax - _vol, this.volumeWidth, 20, _color);

        //Set the temperShape
        //Take the high temperature (400k) and subtract the start temperature, then divide by the total gap (400k - 200k)
        var _tPct = (this.tempMaxK - this.temperature) / 200;
        var _tGap = (this.temperMax - this.temperMin) * _tPct;
        var _colorT = (this.type == 'charles' || this.type == 'gaylussac' || this.type=='combo' || this.type=='ideal') ? '#aa00ff' : '#444444';
        this.temperShape = new Shape(this.temperX, this.temperMin + _tGap, this.temperWidth, 20, _colorT);

        //updateCollisionArea(s);
        this.valid = false;



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

        this._ballLength = 10;
        this._balls = [
            { dx: 4, dy: 4, r: 3, y: this._particleConfig.y + 10, x: this._particleConfig.x + 30, color: "#0000ff", mass: 1 },
            { dx: 4, dy: 4, r: 3, y: this._particleConfig.y + 100, x: this._particleConfig.x + 100, color: "#009900", mass: 1 },
            { dx: 3, dy: 5, r: 3, y: this._particleConfig.y + 50, x: this._particleConfig.x + 50, color: "#0099ff", mass: 1 },
            { dx: 4, dy: 4, r: 3, y: this._particleConfig.y + 45, x: this._particleConfig.x + 30, color: "#ff9900", mass: 1 },
            { dx: 7, dy: 1, r: 3, y: this._particleConfig.y + 75, x: this._particleConfig.x + 55, color: "#ff00ff", mass: 1 },
            { dx: 4, dy: 4, r: 3, y: this._particleConfig.y + 90, x: this._particleConfig.x + 90, color: "#00ff00", mass: 1 },
            { dx: 3, dy: 5, r: 3, y: this._particleConfig.y + 0, x: this._particleConfig.x + 50, color: "#0099ff", mass: 1 },
            { dx: 4, dy: 4, r: 3, y: this._particleConfig.y + 45, x: this._particleConfig.x + 0, color: "#ffff00", mass: 1 },
            { dx: 7, dy: 1, r: 3, y: this._particleConfig.y + 105, x: this._particleConfig.x + 80, color: "#ff00ff", mass: 1 },
            { dx: 7, dy: 1, r: 3, y: this._particleConfig.y + 5, x: this._particleConfig.x + 20, color: "#ff00ff", mass: 1 },
            { dx: 4, dy: 4, r: 3, y: this._particleConfig.y + 15, x: this._particleConfig.x + 35, color: "#0000ff", mass: 1 },
            { dx: 4, dy: 4, r: 3, y: this._particleConfig.y + 105, x: this._particleConfig.x + 105, color: "#009900", mass: 1 },
            { dx: 3, dy: 5, r: 3, y: this._particleConfig.y + 55, x: this._particleConfig.x + 55, color: "#0099ff", mass: 1 },
            { dx: 4, dy: 4, r: 3, y: this._particleConfig.y + 50, x: this._particleConfig.x + 35, color: "#ff9900", mass: 1 },
            { dx: 7, dy: 1, r: 3, y: this._particleConfig.y + 80, x: this._particleConfig.x + 55, color: "#ff00ff", mass: 1 },
            { dx: 4, dy: 4, r: 3, y: this._particleConfig.y + 95, x: this._particleConfig.x + 95, color: "#009900", mass: 1 },
            { dx: 3, dy: 5, r: 3, y: this._particleConfig.y + 5, x: this._particleConfig.x + 55, color: "#0099ff", mass: 1 },
            { dx: 4, dy: 4, r: 3, y: this._particleConfig.y + 45, x: this._particleConfig.x + 5, color: "#ff9900", mass: 1 },
            { dx: 7, dy: 1, r: 3, y: this._particleConfig.y + 110, x: this._particleConfig.x + 85, color: "#ff00ff", mass: 1 },
            { dx: 7, dy: 1, r: 3, y: this._particleConfig.y + 10, x: this._particleConfig.x + 25, color: "#ff00ff", mass: 1 }

        ];

        //this.volShape = new Shape();
        //this.temperShape = new Shape();
        this.needle1 = new Image();
        this.needle1.src = "image/needle.png";
        this.needle1.X = this.needle1X;
        this.needle1.Y = this.needle1Y;


        this.volDragging = false; // Keep track of when we are dragging the volume
        this.temperDragging = false; // Keep track of when we are dragging the temperature
        this.dragoffx = 0; // See mousedown and mousemove events for explanation
        this.dragoffy = 0;

        // **** Then events! ****
        var myState = this;

        if (config.moleSliderId) {
            $(document).on('change', config.moleSliderId, function () {
                var _mol = $(this).val();
                $(config.moleDisplayId).html(_mol);
                if (_mol && _mol > 0) {
                    myState._ballLength = 10 * _mol;
                    if (myState.type == 'avagadro') {
                        myState.pressure = parseFloat(_mol);
                    }
                    if (myState.type == 'ideal') {
                        myState.pressure = idealGasEquation(myState);
                        //myState.pressure = parseFloat(_mol) * myState.R * myState.temperature / myState.volume;
                    }
                    myState.valid=false;
                }
            });
        }

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
            if (myState.type == 'boyle' || myState.type=='combo'|| myState.type=='ideal') {
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
            if (myState.type == 'charles' || myState.type == 'gaylussac' || myState.type=='combo' || myState.type=='ideal') {
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

                
                myState.volume = ((myState.volumeMax - myState.volShape.y + myState.volShape.h) / myState.volumeMax) * myState.volMaxLiter;

                if (myState.type == "boyle") {
                    //Math specific to Boyle's Law
                    myState.pressure = myState.k / myState.volume;
                }

                if (myState.type == "combo") {
                    myState.pressure = myState.k * myState.temperature / myState.volume;
                }
                if (myState.type == 'ideal') {
                    myState.pressure = idealGasEquation(myState);
                }

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
                    myState.volShape.y = (((myState.volMaxLiter - myState.volume) / myState.volMaxLiter) * myState.volumeMax) + myState.volShape.h;
                }
                //Math specific to Gay-Lussac's Law'
                else {
                    if (myState.type == "gaylussac") {
                        myState.pressure = myState.k * myState.temperature;
                    }
                    else {
                        if (myState.type == 'combo') {
                            myState.pressure = myState.k * myState.temperature / myState.volume;
                        }
                        else {
                            if (myState.type == 'ideal') {
                                myState.pressure = idealGasEquation(myState);
                            }
                        }
                    }
                }

                if (myState.type == "charles" || myState.type == "gaylussac" || myState.type == 'combo' || myState.type=='ideal') {
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

        this.valid = false; // when set to false, the canvas will redraw everything

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

            if (this.needle1 && this.needle1.src) {
                ctx.translate(this.needle1.X, this.needle1.Y); // change origin
                var _pct = (this.maxPressure - this.pressure) / this.maxPressure;
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
                this.particles.draw(_cfg, this._balls, this._ballLength);
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

    function idealGasEquation(myState) {
        var _R = 0.082057;
        //var _R = 8.314;
        var _mol = $(myState.moleSliderId).val();
        var p = parseFloat(_mol) * _R * myState.temperature / (myState.volume);
        return p;
    }
  

};
