
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
Shape.prototype.draw = function(ctx) {
  ctx.fillStyle = this.fill;
  ctx.fillRect(this.x, this.y, this.w, this.h);
}

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my) {
  // All we have to do is make sure the Mouse X,Y fall in the area between
  // the shape's X and (X + Width) and its Y and (Y + Height)
  return  (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my);
}

function CanvasState(canvas, config) {
  // **** First some setup! ****
  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;

  this.volume = config.startVolume;
  this.pressure = config.startPressure;
  this.volumeMax = config.volumeMax;
  this.volumeMin = config.volumeMin;
  this.temperature = config.startTemperature;

  this.ctx = canvas.getContext('2d');
  // This complicates things a little but but fixes mouse co-ordinate problems
  // when there's a border or padding. See getMouse for more detail
  var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
  if (document.defaultView && document.defaultView.getComputedStyle) {
    this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
    this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
    this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
    this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
  }
  // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
  // They will mess up mouse coordinates and this fixes that
  var html = document.body.parentNode;
  this.htmlTop = html.offsetTop;
  this.htmlLeft = html.offsetLeft;

  // **** Keep track of state! ****
  
  this.valid = false; // when set to false, the canvas will redraw everything
  //this.shapes = [];  // the collection of things to be drawn
  this.volShape = new Shape(); 
  this.needle1 = new Image();
  this.needle1.X = config.needle1X;
  this.needle1.Y = config.needle1Y;

  this.needle2 = new Image();


  this.dragging = false; // Keep track of when we are dragging
  //// the current selected object. In the future we could turn this into an array for multiple selection
  this.selection = null;
  this.dragoffx = 0; // See mousedown and mousemove events for explanation
  this.dragoffy = 0;
  
  // **** Then events! ****
  var myState = this;
  
  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
  // Up, down, and move are for dragging
  canvas.addEventListener('mousedown', function(e) {
    var mouse = myState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;

   
    if (myState.volShape.contains(mx, my)) {
        var mySel = myState.volShape;
        // Keep track of where in the object we clicked
        // so we can move it smoothly (see mousemove)
        myState.dragoffx = mx - mySel.x;
        myState.dragoffy = my - mySel.y;
        myState.dragging = true;
        myState.selection = mySel;
        myState.valid = false;
        return;
    }
   
    if (myState.selection) {
      myState.selection = null;
      myState.valid = false; // Need to clear the old selection border
    }
  }, true);
  canvas.addEventListener('mousemove', function(e) {
    if (myState.dragging){
      var mouse = myState.getMouse(e);
      // We don't want to drag the object by its top-left corner, we want to drag it
      // from where we clicked. Thats why we saved the offset and use it here
      //myState.selection.x = mouse.x - myState.dragoffx;
      myState.selection.y = mouse.y - myState.dragoffy;   

      if (myState.selection.y < myState.volumeMin) {
          myState.selection.y = myState.volumeMin;
      }
      if (myState.selection.y > myState.volumeMax) {
          myState.selection.y = myState.volumeMax;
      }

      var _totalVol = myState.volumeMax - myState.volumeMin;
      myState.volume = ((_totalVol - myState.selection.y + myState.selection.h) / (_totalVol) * 4);
      myState.pressure = 1 / myState.volume;

      myState.valid = false; // Something's dragging so we must redraw
    }
  }, true);
  canvas.addEventListener('mouseup', function(e) {
      myState.dragging = false;
      myState.selection = null;
      myState.valid = false;
  }, true);
 

  this.selectionColor = '#CC0000';
  this.selectionWidth = 2;  
  this.interval = 30;
  setInterval(function() { myState.draw(); }, myState.interval);
}

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
}

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function() {
  // if our state is invalid, redraw and validate!
  if (!this.valid) {
    var ctx = this.ctx;
    //var shapes = this.shapes;
    this.clear();
    
    // ** Add stuff you want drawn in the background all the time here **
    if (this.needle1 && this.needle1.src) {
        ctx.translate(this.needle1.X, this.needle1.Y); // change origin
        var _pct = (4 - this.pressure) / 4;
        var _degrees = 90 * _pct - 45;
        var _angleInRadians = (Math.PI / 4 - (Math.PI / 4 * _pct)) - Math.PI / 4;
        //var _angleInRadians = Math.PI / 10;
        ctx.rotate(_angleInRadians);
        //ctx.drawImage(this.needle1, 70, 220);
        ctx.drawImage(this.needle1, -this.needle1.width/2, -this.needle1.height);
        ctx.rotate(-_angleInRadians);
        ctx.translate(-this.needle1.X, -this.needle1.Y); // change origin back
    }
    if (this.needle2 && this.needle2.src) {
        ctx.drawImage(this.needle2, 460, 220);
    }
    
    this.volShape.draw(ctx);

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(this.volume.toFixed(2) + " L", ctx.canvas.width / 2, 20);
    ctx.fillText(this.pressure.toFixed(2) + " atm", ctx.canvas.width/8, ctx.canvas.height / 3);
    ctx.fillText(this.temperature.toFixed(2) + " K", (ctx.canvas.width/8) * 7 , ctx.canvas.height / 3);



    // draw selection
    // right now this is just a stroke along the edge of the selected Shape
    if (this.selection != null) {
      ctx.strokeStyle = this.selectionColor;
      ctx.lineWidth = this.selectionWidth;
      var mySel = this.selection;
      ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
    }
    

    // ** Add stuff you want drawn on top all the time here **
    
    this.valid = true;
  }
}


// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasState.prototype.getMouse = function(e) {
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

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;
  
  // We return a simple javascript object (a hash) with x and y defined
  return {x: mx, y: my};
}

function init() {
    var config = {};
    config.startPressure = 1.0;
    config.startVolume = 1.0;
    config.startTemperature = 303.15;
    config.volumeMax = 350;
    config.volumeMin = 10;
    config.needle1X = 78;
    config.needle1Y = 290;


    var s = new CanvasState(document.getElementById('canvas1'), config);
    s.needle1.src = "image/needle.png";
    s.needle2.src = "image/needle.png";

    s.volShape = new Shape(152, 180, 243, 20, '#aa00ff'); 
    s.valid = false;
}

