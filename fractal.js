frameRate(4);

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
};
var line2 = {
    x1: margin + tSide,
    y1: margin,
    x2: margin + tSide / 2,
    y2: margin + tBase,
};
line2.xNext = average(line2.x1, line2.x2) + cos(30) * tBaseLevel2;
line2.yNext = average(line2.y1, line2.y2) + sin(30) * tBaseLevel2;

// var line3 = {
//     x1: margin + tSide / 2,
//     y1: margin + tBase,
//     x2: margin,
//     y2: margin,
// };
// line3.xNext = average(line3.x1, line3.x2) - cos(30) * tBaseLevel2;
// line3.yNext = average(line3.y1, line3.y2) + sin(30) * tBaseLevel2;

// var lines = [line1, line2, line3];
var lines = [line1];

var triangleCenter = function () {
    // Get the center of our specific triangle.
    // Could be used to inscribe a circle.
    // Will not work for every triangle.
    var midX = (line1.x1 + line1.x2) / 2;
    var midY = line1.y1 + tSide * sqrt(3) / 6;
    return {x: midX, y: midY};
};

var tCenter = triangleCenter(lines);

var resetCanvas = function () {
    noStroke();
    fill(255, 255, 255);
    rect(0, 0, width, height);
    noFill();
    stroke(0, 0, 0);
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

var rotateLine = function (myLine, center, degrees) {
    // Rotate myline about the center of the triangle
    // Return a line object with fields x1, x2, y1, y2, xNext, yNext
    var rotated1 = myRotate(myLine.x1, myLine.y1, center.x, center.y, degrees);
    var rotated2 = myRotate(myLine.x2, myLine.y2, center.x, center.y, degrees);
    var rotatedNext = myRotate(myLine.xNext, myLine.yNext, center.x, center.y, degrees);
    var rotatedLine = {
        x1: rotated1.x, y1: rotated1.y,
        x2: rotated2.x, y2: rotated2.y,
        xNext: rotatedNext.x, yNext: rotatedNext.y,
    };
    return rotatedLine;

};

var midpoint = function (p1, p2) {
    // Returns the point halfway between p1 and p2
    return new PVector(average(p1.x, p2.x), average(p1.y, p2.y));
};

var getNextLevelKochLines = function (myLine) {
    // Turn a line ___ into 4 lines _/\_ representing the next level Koch form.
    var point1X = myLine.x1 * 2 / 3 + myLine.x2 / 3;
    var point1Y = myLine.y1 * 2 / 3 + myLine.y2 / 3;
    // Point2 is (myLine.xNext, myLine.yNext)
    var point3X = myLine.x1 / 3 + myLine.x2 * 2 / 3;
    var point3Y = myLine.y1 / 3 + myLine.y2 * 2 / 3;

    var segment1 = {
        x1: myLine.x1,
        y1: myLine.y1,
        x2: point1X,
        y2: point1Y,
    };

    var segment2 = {
        x1: segment1.x2,
        y1: segment1.y2,
        x2: myLine.xNext,
        y2: myLine.yNext,
    };
    var segment3 = {
        x1: segment2.x2,
        y1: segment2.y2,
        x2: point3X,
        y2: point3Y,
    };
    var segment4 = {
        x1: segment3.x2,
        y1: segment3.y2,
        x2: myLine.x2,
        y2: myLine.y2,
    };

    var p1 = new PVector(myLine.x1, myLine.y1);
    var p2 = new PVector(myLine.x2, myLine.y2);
    var pp1 = new PVector(point1X, point1Y);
    var pp3 = new PVector(point3X, point3Y);
    var pNext = new PVector(myLine.xNext, myLine.yNext);

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

    segment1.xNext = pNextNew1.x;
    segment1.yNext = pNextNew1.y;
    segment2.xNext = pNextNew2.x;
    segment2.yNext = pNextNew2.y;
    segment3.xNext = pNextNew3.x;
    segment3.yNext = pNextNew3.y;
    segment4.xNext = pNextNew4.x;
    segment4.yNext = pNextNew4.y;
    return [segment1, segment2, segment3, segment4];
};

var currentLines = lines;
var timesClicked = 0;

var makeItMorePointy = function () {
    timesClicked = (timesClicked + 1) % 6;
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

var draw = function () {
    resetCanvas();
    stroke(0, 0, 0);

    for (var i = 0; i < currentLines.length; i++) {
        var l = currentLines[i];

        line(l.x1, l.y1, l.x2, l.y2);

        l = rotateLine(l, tCenter, 120);
        line(l.x1, l.y1, l.x2, l.y2);
        l = rotateLine(l, tCenter, 120);
        line(l.x1, l.y1, l.x2, l.y2);
    }
};
