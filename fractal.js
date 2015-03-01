 /*****************************************************************************
 * Visualization of the construction of the Koch Snowflake, one of the first
 * fractals to be described!
 *
 * Every time you click on the snowflake, every line ____ is replaced by 4
 * lines representing the next level of the snowflake: _/\_.  After enough
 * clicks, the snowflake is reset to the original starting triangle.
 *
 * Implementation note: we don't actually compute all the lines.  Instead, we
 * focus on just one third of the triangle (the top side), and then duplicate
 * and rotate it twice to draw the other two sides.  This turns out to be
 * tangibly faster on my machine.
 *
 * Controls:
 * Click to have fun.
 *
 *****************************************************************************/

frameRate(3);

var maxLevels = 6;
var margin = 100;
var tSide = 200;

var currentColorIndex = 0;
var colors = [
    color(219, 33, 33),
    color(59, 185, 227),
    color(27, 222, 50),
    color(230, 55, 230),
    color(255, 153, 0),
];

var getNextColor = function () {
    // Cycle through colors, returning the next one with each call.
    // Depends on global currentColorIndex.
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    return colors[currentColorIndex];
};

var baseHeightEquilateral = function (sideLength) {
    // Get the height of the base of an equilateral triangle given side length
    return sqrt(3 / 4 * sideLength * sideLength);
};

var tBase = baseHeightEquilateral(tSide);
var tBaseLevel2 = baseHeightEquilateral(tSide / 3);
var line1 = {
    p1: new PVector(margin, margin),
    p2: new PVector(margin + tSide, margin),
    pNext: new PVector( margin + tSide / 2, margin - baseHeightEquilateral(tSide / 3)),
    appearance: getNextColor(),
};
var lines = [line1];

var triangleCenter = function () {
    // Get the center of our specific triangle.  Depends on global state.
    // Could be used to inscribe a circle.
    // Will not work for every triangle.
    var midX = (line1.p1.x + line1.p2.x) / 2;
    var midY = line1.p1.y + tSide * sqrt(3) / 6;
    return new PVector(midX, midY);
};

var tCenter = triangleCenter();

var rotateAboutCenter = function (p, pCenter, degrees) {
    // Rotate the point p around pCenter the specified amount of degrees.
    // var pNew = p.get();
    //
    var pNew = new PVector(p.x, p.y);
    pNew.sub(pCenter);
    pNew.rotate(degrees);
    pNew.add(pCenter);
    return pNew;
};

var rotateLineAboutCenter = function (liney, center, degrees) {
    // Rotate liney about the center of the triangle
    // Return a line object with fields x1, x2, y1, y2, xNext, yNext
    var rotatedLine = {
        p1: rotateAboutCenter(liney.p1, center, degrees),
        p2: rotateAboutCenter(liney.p2, center, degrees),
        pNext: rotateAboutCenter(liney.pNext, center, degrees),
        appearance: liney.appearance,
    };
    return rotatedLine;
};

var midpoint = function (p1, p2) {
    // Returns the point halfway between p1 and p2
    return new PVector((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
};

var getNextLevelKochLines = function (liney) {
    // Turn a line ____ into 4 segments _/\_ that are the next level Koch form.
    var point1X = liney.p1.x * 2 / 3 + liney.p2.x / 3;
    var point1Y = liney.p1.y * 2 / 3 + liney.p2.y / 3;
    var newPoint1 = new PVector(point1X, point1Y);
    // Point2 is liney.pNext
    var point3X = liney.p1.x / 3 + liney.p2.x * 2 / 3;
    var point3Y = liney.p1.y / 3 + liney.p2.y * 2 / 3;
    var newPoint3 = new PVector(point3X, point3Y);
    var newColor = getNextColor();

    var segment1 = {
        p1: liney.p1,
        p2: newPoint1,
        appearance: liney.appearance,
    };
    var segment2 = {
        p1: segment1.p2,
        p2: liney.pNext,
        appearance: newColor,
    };
    var segment3 = {
        p1: segment2.p2,
        p2: newPoint3,
        appearance: newColor,
    };
    var segment4 = {
        p1: segment3.p2,
        p2: liney.p2,
        appearance: liney.appearance,
    };

    var midpointWholeLine = midpoint(liney.p1, liney.p2);
    var vector = liney.pNext.get();
    vector.sub(midpointWholeLine);
    vector.div(3);

    var pNextNew1 = midpoint(liney.p1, newPoint1);
    pNextNew1.add(vector);
    var pNextNew4 = midpoint(liney.p2, newPoint3);
    pNextNew4.add(vector);

    vector.rotate(-60);
    var pNextNew2 = midpoint(newPoint1, liney.pNext);
    pNextNew2.add(vector);

    vector.rotate(120);
    var pNextNew3 = midpoint(liney.pNext, newPoint3);
    pNextNew3.add(vector);

    var segments = [segment1, segment2, segment3, segment4];
    var pNextNews = [pNextNew1, pNextNew2, pNextNew3, pNextNew4];
    for (var i = 0; i < segments.length; i++) {
        segments[i].pNext = pNextNews[i];
    }
    return segments;
};

var currentLines = lines;
var timesClicked = 0;
var nextLevelLines = [];
var calculatingNextLevel = false;
var needToDraw = true;

var computeNextKochLevel = function () {
    calculatingNextLevel = true;
    timesClicked = (timesClicked + 1) % maxLevels;
    if (timesClicked > 0) {
        nextLevelLines = [];
        for (var i = 0; i < currentLines.length; i++) {
            var l = currentLines[i];
            var kochLines = getNextLevelKochLines(l);
            nextLevelLines.push.apply(nextLevelLines, kochLines);
        }
    } else {
        nextLevelLines = lines;
    }
    calculatingNextLevel = false;
};
computeNextKochLevel();

var advanceToNextKochLevel = function () {
    if (!calculatingNextLevel) {
        currentLines = nextLevelLines;
        computeNextKochLevel();
        needToDraw = true;
    }
};

mouseClicked = advanceToNextKochLevel;

var drawLine = function (liney) {
    // Draw the line `liney` with the correct color.
    stroke(liney.appearance);
    line(liney.p1.x, liney.p1.y, liney.p2.x, liney.p2.y);
    stroke(0, 0, 0);
};

var resetState = function () {
    // Resets the state of the canvas and color index for next frame.
    noStroke();
    fill(7, 15, 4);
    rect(0, 0, width, height);
    noFill();
    stroke(0, 0, 0);
    currentColorIndex = 1;
};

var draw = function () {
    // Erases and draws our snowflake.  Called several times per second.
    if (!needToDraw) { return; }

    resetState();
    stroke(0, 0, 0);

    for (var i = 0; i < currentLines.length; i++) {
        var l = currentLines[i];
        drawLine(l);
        l = rotateLineAboutCenter(l, tCenter, 120);
        drawLine(l);
        l = rotateLineAboutCenter(l, tCenter, 120);
        drawLine(l);
    }
    needToDraw = false;
};
