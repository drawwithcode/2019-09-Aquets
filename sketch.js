//____THE______________________
//_________BIG BOY_____________
//_________________SLIME_______

var vertexes = []; //array that will contain the vertex of the slime
var r = 400; //slime radius
var posX = 500; //slime CENTER X
var posY = 500; //slime CENTER Y
var amplitude = 40; //amplitude of the noise
var speed = 100; //speed of the noise

//BOONES relative positions
var setSkull = {
  x: 0,
  y: - 150
}
var setRibs = {
  x: 0,
  y: + 50
}
var setBone1 = {
  x: - 200,
  y: + 50
}
var setBone2 = {
  x: + 200,
  y: + 50
}

//load the images
function preload() {
  skull = loadImage("assets/skull.png");
  ribs = loadImage("assets/ribs.png");
  bone1 = loadImage("assets/bone1.png");
  bone2 = loadImage("assets/bone2.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  //set the shaking
  setShakeThreshold(70)

  angleMode(DEGREES)
  //create the vertexes of the SLIME in a circle
  for (var i = 0; i <= 360; i += 15) {
    var tempP = new Point(i); //each vertex has an angle
    vertexes.push(tempP); //push the vertex in the array
  }
}

function draw() {
  clear();

  //move the SLIME with the device orientation
  posY = posY + 0.3*rotationX;
  posX = posX + 0.3*rotationY;

  //set the X bounds of the screen
  if (posX > width) {
    posX = width;
  }else if (posX < 0){
    posX = 0;
  }
  //set the Y bounds of the screen
  if (posY > height) {
    posY = height;
  }else if (posY < 0){
    posY = 0;
  }

  //draw the BONES
  imageMode(CENTER)
  //each bone is set with:
  //___POSITION OF THE SLIME + ITS RELATIVE POSITION + A NOISE VALUE___
  //(the noise it's taken from some vertex)
  image(bone1,posX + vertexes[9].noiseX + setBone1.x, posY + vertexes[9].noiseY + setBone1.y);
  image(bone2,posX + vertexes[15].noiseX + setBone2.x,posY + vertexes[15].noiseY + setBone2.y);
  image(ribs,posX + vertexes[5].noiseX + setRibs.x, posY + vertexes[5].noiseY + setRibs.y);
  image(skull,posX + vertexes[2].noiseX + setSkull.x, posY + vertexes[2].noiseY + setSkull.y);

  //DRAW THE SLIME!
  fill(0,255,0,150) //transparent green for the body
  noStroke();

  //begin the shape and add all the vertex of VERTEXES array
  beginShape();
  for (var i = 0; i < vertexes.length; i++) {
    var tempP = vertexes[i];
    //update the position of the vertex with the CENTER of the SLIME
    //and the noise values, AMPLITUDE and SPEED
    tempP.update(posX, posY, amplitude, speed);
    //each point it's a curve point
    curveVertex(tempP.x,tempP.y);
  }
  endShape();

  //eyes and mouth colors
  stroke(255,255,0,255)
  strokeWeight(10)
  fill(0,0,0,150);

  ellipse(posX - 50, posY - 100, 30) //eye
  ellipse(posX + 50, posY - 100, 30) //eye
  line(posX -30,posY - 50, posX+30,posY - 50) //mouth

  //restore slowly the AMPLITUDE and the SPEED
  //after the device shaken
  amplitude-= 0.1;
  if (amplitude <= 40) {
    amplitude = 40;
  }
  speed+= 0.3;
  if (speed >= 100) {
    speed = 100;
  }
}

//run when the device is shaken
function deviceShaken() {
  frameCount = 1000; //prevent speed errors in the noise

  amplitude = 100; //make the amplitude bigger
  speed = 50; //set the speed faster
  //randomize the BONES relative positions
  randomize(setSkull);
  randomize(setRibs);
  randomize(setBone1);
  randomize(setBone2);
}

//set random X and Y for and object, but still in the SLIME dimensions
function randomize(_obj) {
  var angle = random(0,360) //chose a random angle
  var spanX = cos(angle)*r*0.7 //set the span of the X according to the radius
  var spanY = sin(angle)*r*0.7 //set the span of the Y according to the radius
  _obj.x = random(-spanX, + spanX); //chose a random X from the x-span
  _obj.y = random(-spanY, + spanY); //chose a random Y from the y-span
}

//the POINT OBJECT is the moving vertex of the shape
function Point(_angle) {
  //each point has an angle that give its position
  this.angle = _angle;
  //set the random seeds for X and Y
  this.noiseSeedX = random();
  this.noiseSeedY = random();
  //other attributes of the point
  this.x;
  this.y;
  this.noiseX;
  this.noiseY;

  //the update method refresh the posion of the POINT
  this.update = function(_centerx, _centery, _noiseAmp, _noiseSpeed) {

    var noiseAmp = _noiseAmp; //regualte the amplitude of the noise
    var noiseSpeed = _noiseSpeed; //regulate the speed of the noise

    //the noise in each dimension (x and y) is calculated from
    //a noise value from -AMPLITUDE to +AMPLITUDE
    this.noiseX = map(noise(frameCount / noiseSpeed + this.noiseSeedX), 0, 1, -noiseAmp, +noiseAmp);
    this.noiseY = map(noise(frameCount / noiseSpeed + this.noiseSeedY), 0, 1, -noiseAmp, +noiseAmp);

    var radius = r; // the radius is equal to the SLIME radius
    //calcualte the postion from the RADIUS, the ANGLE and NOISE
    var tempx = cos(_angle) * radius + this.noiseX;
    var tempy = sin(_angle) * radius + this.noiseY;
    this.x = _centerx + tempx; //update the x
    this.y = _centery + tempy; //update the y

    var startSquash = 50; //it's the margin where the slime starts squaushing
    //X BOUNDS
    //the squashing (on the this.y) increase when the distance from the bound decreases
    if (this.x >= width - startSquash) {
      var d = Math.sign(abs(_centery) - abs(this.y))
      this.y = this.y + d*(width - startSquash - this.x);
    }
    if (this.x <= startSquash) {
      var d = Math.sign(abs(this.y) - abs(_centery))
      this.y = this.y + d*(-this.x + startSquash);
    }
    //Y BOUNDS
    //the squashing (on the this.x) increase when the distance from the bound decreases
    if (this.y >= height - startSquash) {
      var d = Math.sign(abs(_centerx) - abs(this.x))
      this.x = this.x + d*(height - startSquash - this.y);
    }
    if (this.y <= startSquash) {
      var d = Math.sign(abs(this.x) - abs(_centerx))
      this.x = this.x + d*(-this.y + startSquash);
    }
  }
}

//for the stupid iPhones that need the permession
function touchEnded(event) {
  DeviceOrientationEvent.requestPermission()
}
