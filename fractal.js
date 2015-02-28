frameRate(4);

var maxLevels = 6;

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

var average = function (x1, x2) {
    return (x1 + x2) / 2;
};

var margin = 100;
var tSide = 200;
var tBase = baseHeightEquilateral(tSide);
var tBaseLevel2 = baseHeightEquilateral(tSide / 3);
var line1 = {
    x1: margin,
    y1: margin,
    x2: margin + tSide,
    y2: margin,
    xNext: margin + tSide / 2,
    yNext: margin - baseHeightEquilateral(tSide / 3),
    //appearance: color(28, 79, 232),
    appearance: getNextColor(),
};
var lines = [line1];

var triangleCenter = function (pointy) {
    // Get the center of our specific triangle.
    // Could be used to inscribe a circle.
    // Will not work for every triangle.
    var midX = (pointy.x1 + pointy.x2) / 2;
    var midY = pointy.y1 + tSide * sqrt(3) / 6;
    return {x: midX, y: midY};
};

var tCenter = triangleCenter(line1);

var resetState = function () {
    // Resets the state of the canvas and color index for next frame.
    noStroke();
    fill(7, 15, 4);
    rect(0, 0, width, height);
    noFill();
    stroke(0, 0, 0);
    currentColorIndex = 1;
};

var myRotate = function (x1, y1, centerX, centerY, degrees) {
    // Rotate the point (x1, y1) 120 degrees around (centerX, centerY)
    x1 = x1 - centerX;
    y1 = y1 - centerY;
    var x2 = x1 * cos(degrees) - y1 * sin(degrees);
    var y2 = x1 * sin(degrees) + y1 * cos(degrees);
    x2 = x2 + centerX;
    y2 = y2 + centerY;
    return {x: x2, y: y2};
};

var rotateLine = function (pointy, center, degrees) {
    // Rotate pointy about the center of the triangle
    // Return a line object with fields x1, x2, y1, y2, xNext, yNext
    var rotated1 = myRotate(pointy.x1, pointy.y1, center.x, center.y, degrees);
    var rotated2 = myRotate(pointy.x2, pointy.y2, center.x, center.y, degrees);
    var rotatedNext = myRotate(pointy.xNext, pointy.yNext, center.x, center.y, degrees);
    var rotatedLine = {
        x1: rotated1.x, y1: rotated1.y,
        x2: rotated2.x, y2: rotated2.y,
        xNext: rotatedNext.x, yNext: rotatedNext.y,
        appearance: pointy.appearance,
    };
    return rotatedLine;

};

var midpoint = function (p1, p2) {
    // Returns the point halfway between p1 and p2
    return new PVector(average(p1.x, p2.x), average(p1.y, p2.y));
};

var getNextLevelKochLines = function (pointy) {
    // Turn a line ____ into 4 segments _/\_ that are the next level Koch form.
    var point1X = pointy.x1 * 2 / 3 + pointy.x2 / 3;
    var point1Y = pointy.y1 * 2 / 3 + pointy.y2 / 3;
    // Point2 is (pointy.xNext, pointy.yNext)
    var point3X = pointy.x1 / 3 + pointy.x2 * 2 / 3;
    var point3Y = pointy.y1 / 3 + pointy.y2 * 2 / 3;
    var newColor = getNextColor();

    var segment1 = {
        x1: pointy.x1,
        y1: pointy.y1,
        x2: point1X,
        y2: point1Y,
        appearance: pointy.appearance,
    };

    var segment2 = {
        x1: segment1.x2,
        y1: segment1.y2,
        x2: pointy.xNext,
        y2: pointy.yNext,
        appearance: newColor,
    };
    var segment3 = {
        x1: segment2.x2,
        y1: segment2.y2,
        x2: point3X,
        y2: point3Y,
        appearance: newColor,
    };
    var segment4 = {
        x1: segment3.x2,
        y1: segment3.y2,
        x2: pointy.x2,
        y2: pointy.y2,
        appearance: pointy.appearance,
    };

    var p1 = new PVector(pointy.x1, pointy.y1);
    var p2 = new PVector(pointy.x2, pointy.y2);
    var pp1 = new PVector(point1X, point1Y);
    var pp3 = new PVector(point3X, point3Y);
    var pNext = new PVector(pointy.xNext, pointy.yNext);

    var midpointWholeLine = midpoint(p1, p2);
    var vector = new PVector(pNext.x, pNext.y);
    vector.sub(midpointWholeLine);
    vector.div(3);

    var pNextNew1 = midpoint(p1, pp1);
    pNextNew1.add(vector);
    var pNextNew4 = midpoint(p2, pp3);
    pNextNew4.add(vector);

    vector.rotate(-60);
    var pNextNew2 = midpoint(pp1, pNext);
    pNextNew2.add(vector);

    vector.rotate(120);
    var pNextNew3 = midpoint(pNext, pp3);
    pNextNew3.add(vector);

    var segments = [segment1, segment2, segment3, segment4];
    var pNextNews = [pNextNew1, pNextNew2, pNextNew3, pNextNew4];
    for (var i = 0; i < segments.length; i++) {
        segments[i].xNext = pNextNews[i].x;
        segments[i].yNext = pNextNews[i].y;
    }
    return segments;
};

var currentLines = lines;
var timesClicked = 0;

var makeItMorePointy = function () {
    timesClicked = (timesClicked + 1) % maxLevels;
    if (timesClicked > 0) {
        var nextLevelLines = [];
        for (var i = 0; i < currentLines.length; i++) {
            var l = currentLines[i];
            var kochLines = getNextLevelKochLines(l);
            nextLevelLines.push.apply(nextLevelLines, kochLines);
        }
        currentLines = nextLevelLines;
    } else {
        currentLines = lines;
    }
};

mouseClicked = makeItMorePointy;

var drawLine = function (pointy) {
    stroke(pointy.appearance);
    line(pointy.x1, pointy.y1, pointy.x2, pointy.y2);
    stroke(0, 0, 0);
};
var draw = function () {
    resetState();
    stroke(0, 0, 0);

    for (var i = 0; i < currentLines.length; i++) {
        var l = currentLines[i];
        drawLine(l);
        l = rotateLine(l, tCenter, 120);
        drawLine(l);
        l = rotateLine(l, tCenter, 120);
        drawLine(l);
    }
};
