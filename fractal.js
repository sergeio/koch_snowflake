 /*****************************************************************************
 * Visualization of the construction of the Koch Snowflake, and the growth of
 * its perimeter and area.
 *
 * Can be used to accompany this series:
 * https://www.khanacademy.org/math/geometry/basic-geometry/koch_snowflake/v
 * /koch-snowflake-fractal
 *
 * Every time you click on the snowflake, every line ____ is replaced by 4
 * lines representing the next level of the snowflake: _/\_.  After enough
 * clicks, the snowflake is reset to the original starting triangle.
 *
 * Implementation note: we don't actually compute all the lines.  Instead, we
 * focus on just one third of the triangle (the top side), and then duplicate
 * and rotate it twice to draw the other two sides.  This turns out to be
 * tangibly faster on my poor computer.  It's OK, computer; it'll be over soon.
 *
 * Controls:
 * Click to have fun.
 *
 * Author: Sergei O
 *****************************************************************************/

var maxLevels = 6;
var tSize = 200;  // <--- Try changing me to 400!
var margin = 100;

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

// The line that will be duplicated and rotated to make our initial triangle.
var line1 = {
    p1: new PVector(margin, margin),
    p2: new PVector(margin + tSize, margin),
    pNext: new PVector(margin + tSize / 2, margin - baseHeightEquilateral(tSize / 3)),
    appearance: getNextColor(),
};
var lines = [line1];
var originalPerimeter = tSize * 3;
var originalArea = 0.5 * tSize * baseHeightEquilateral(tSize);
// There is no actual maximum perimeter, but this the max we will reach.
var maxPerimeter = originalPerimeter * pow(4/3, maxLevels - 1);
var maxArea = originalArea;
for (var i = 1; i < maxLevels; i++) {
    maxArea = 3 / 4 * pow(4 / 9, i) * originalArea + maxArea;
}

var triangleCenter = function () {
    // Get the center of our specific triangle.  Depends on global state.
    // Could be used to inscribe a circle.
    // Will not work for every triangle.
    var midX = (line1.p1.x + line1.p2.x) / 2;
    var midY = line1.p1.y + tSize * sqrt(3) / 6;
    return new PVector(midX, midY);
};

var tCenter = triangleCenter();

var rotateAboutCenter = function (p, pCenter, degrees) {
    // Rotate the point p around pCenter the specified amount of degrees.
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
    // Return a list of the 4 segments.
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

    segment1.pNext = midpoint(liney.p1, newPoint1);
    segment1.pNext.add(vector);

    segment4.pNext = midpoint(liney.p2, newPoint3);
    segment4.pNext.add(vector);

    vector.rotate(-60);
    segment2.pNext = midpoint(newPoint1, liney.pNext);
    segment2.pNext.add(vector);

    vector.rotate(120);
    segment3.pNext = midpoint(liney.pNext, newPoint3);
    segment3.pNext.add(vector);

    var segments = [segment1, segment2, segment3, segment4];
    return segments;
};

var currentLines = lines;
var level = 0;
var currentPerimeter = originalPerimeter;
var currentArea = originalArea;
var areaData = [currentArea];
var perimeterData = [currentPerimeter];

var computeNextKochLevel = function () {
    // Calculate the set of lines that will be shown next time the user clicks.
    var nextLevelLines = [];
    for (var i = 0; i < currentLines.length; i++) {
        var l = currentLines[i];
        var kochLines = getNextLevelKochLines(l);
        nextLevelLines.push.apply(nextLevelLines, kochLines);
    }
    currentLines = nextLevelLines;
};

var updateStats = function () {
    // Increment our perimeter and area stats.
    currentPerimeter = 4 * currentPerimeter / 3;
    perimeterData.push(currentPerimeter);
    currentArea = 3 / 4 * pow(4 / 9, level) * originalArea + currentArea;
    areaData.push(currentArea);
};

var resetStats = function () {
    // Reset stats so that we are drawing the original triangle again.
    currentLines = lines;
    currentPerimeter = originalPerimeter;
    currentArea = originalArea;
    areaData = [originalArea];
    perimeterData = [originalPerimeter];
};

var drawLine = function (liney) {
    // Draw line liney with the correct color.
    stroke(liney.appearance);
    line(liney.p1.x, liney.p1.y, liney.p2.x, liney.p2.y);
    stroke(0, 0, 0);
};

var maxBarHeight = 15;
var drawGraph = function (x, y, data, maxOfData) {
    // Graph the data at the specified coordinates.
    noStroke();
    fill(0, 0, 0);
    rect(x - 3, y - 15, 11 * data.length, maxBarHeight);
    for (var i = 0; i < data.length; i++) {
        var barHeight = maxBarHeight * data[i] / maxOfData;
        fill(150, 150, 150);
        rect(x, y - 15 + maxBarHeight - barHeight, 5, barHeight);
        x += 11;
    }
    stroke(0, 0, 0);
};

var drawStats = function () {
    // Draws the area and perimeter stats and graphs.
    fill(255, 255, 255);
    textSize(12);
    var x = 10;
    var perimeterY = height - 10;
    var areaY = height - 30;
    text("Perimeter: " + round(currentPerimeter) + " pixels", x, perimeterY);
    text("Area: " + round(currentArea) + " sq. pixels", x, areaY);
    drawGraph(x + 130, areaY, areaData, maxArea);
    drawGraph(x + 130, perimeterY, perimeterData, maxPerimeter);
};

var drawSnowFlake = function () {
    // Draws the snowflake.
    for (var i = 0; i < currentLines.length; i++) {
        var l = currentLines[i];
        drawLine(l);
        l = rotateLineAboutCenter(l, tCenter, 120);
        drawLine(l);
        l = rotateLineAboutCenter(l, tCenter, 120);
        drawLine(l);
    }
};

var drawInstructions = function () {
    // Draws the area and perimeter stats and graphs.
    fill(100, 100, 100);
    textSize(12);
    text("Try clicking! Try playing with the code!", 10, 20);
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

var mouseClicked = function () {
    // On mouse click:
    // Either make our snowflake more pointy, or reset to original.
    level = (level + 1) % maxLevels;
    if (level > 0) {
        computeNextKochLevel();
        updateStats();
    } else {
        resetStats();
    }
    draw();
};

frameRate(1);
var draw = function () {
    // Main entrypoint.  Called once per second.
    resetState();
    drawInstructions();
    drawSnowFlake();
    drawStats();
};
