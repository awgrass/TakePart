/*

Function: getXTicks
Function evaluating how to evenly divide the space on the x-axis for the ticks.

Parameters:
{Number} start - the start of the x axis
{Number} stop - the end of the x axis
{Number} amount - number of ticks
*/
function getXTicks(start, stop, amount){
    let ticks = [];
    let currValue = start;
    let step = (stop - start) / (amount - 1);
    for (var i = 0; i < amount; i++) {
        ticks.push(currValue + (step * i));
    }
    return ticks;
}

/*

Function: createLine
Creates a SVG line element.

Parameters:
{Number} x1 - x coordinate of line begin
{Number} y1 - y coordinate of line begin
{Number} x2 - x coordinate of line end
{Number} y2 - y coordinate of line end
*/
function createLine(x1, y1, x2, y2){
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#0F4170");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-width", "1");
    line.setAttribute("stroke-linejoin", "miter");

    return line;
}

/*

Function: createText
Creates a SVG Text element.

Parameters:
{Number} x - x coordinate of text start
{Number} y - y coordinate of text start
{String} text - text
*/
function createText(x, y, text){
    let textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute("x", x);
    textElement.setAttribute("y", y);
    textElement.textContent = text;
    return textElement;
}

/*

Function: createCircle
Creates a SVG circle element.

Parameters:
{Number} x - x coordinate of circle center
{Number} y - y coordinate of circle center
{Number} r - radius
*/
function createCircle(x, y, r){
    let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", r);
    circle.setAttribute("fill", "white");
    return circle;
}

/*

Function: createGraphTitle
Creates the graph title.

Parameters:
{String} title - title
*/
function createGraphTitle(title){
    return createText(45, 7.5, title);
}

/*

Function: createXLabel
Creates a label on the x axis.

Parameters:
{Number} xCoord - coordinate on the x axis
{String} text - label
*/
function createXLabel(xCoord, text){
    let offset = 5; //offset to place label in the middle
    return createText(xCoord-offset, 117, text);
}

/*

Function: convertRatioToRealY
Converts the attendee ration to the corresponding point on the y axis.

Parameters:
{Number} ratio - ratio (participants/registered)
*/
function convertRatioToRealY(ratio){
    return 100 - (ratio * 100) + 10;
}

/*

Function: getMaximalShowableDates
Get maximal number of showable points until statistic view looks bad.

Parameters:
{Course} course - the course object which holds the statistic data
*/
function getMaximalShowableDates(course){
    let maximalShowableEventsTillViewGetsBad = 8;
    return course.statistics.length >= maximalShowableEventsTillViewGetsBad ?
        maximalShowableEventsTillViewGetsBad :
        course.statistics.length;
}

/*

Function: createStat1
Creates the Statistic 1 of the app.

Parameters:
{Course} courseName - course name of the course which holds the statistic
{Function} callback - callback
*/
function createStat1(courseName, callback){
    requestFileAsynchronously("stat1.html", function(caller){
        let svgElement = HTMLToElement(caller.responseText);
        getCourseByName(courseName, function(course){
            //TODO: a beautiful solution would be to to scale the fontsize with more and more dates
            const numberOfPastEvents = getMaximalShowableDates(course);
            const xTicks = getXTicks(15, 205, numberOfPastEvents);
            let dataPoints = [];
            let xLabelsAxis = svgElement.getElementsByClassName("x-labels")[0];
            for (let i = 0; i < numberOfPastEvents; ++i){
                dataPoints.push(course.statistics[i].participated / course.statistics[i].registeredAtThisTime);
                let labelText = timestampToDate(course.statistics[i].date);
                let label = createXLabel(xTicks[i], labelText);
                xLabelsAxis.appendChild(label);
            }
            let realYs = [];
            for (let i = 0; i < numberOfPastEvents; ++i) {
                realYs.push(convertRatioToRealY(dataPoints[i]));
            }
            let lines = svgElement.getElementsByClassName("stat1-lines")[0];
            for (let i = 0; i < numberOfPastEvents - 1; ++i){
                let line = createLine(xTicks[i], realYs[i], xTicks[i+1], realYs[i+1]);
                lines.appendChild(line);
            }
            for (let i = 0; i < numberOfPastEvents; ++i){
                let circle = createCircle(xTicks[i], realYs[i], 0.7);
                lines.append(circle);
            }
            let title = svgElement.getElementsByClassName('stat1-title')[0];
            title.appendChild(createGraphTitle("Teilnehmer in Prozent pro Einheit"));
            callback(svgElement);
        });
    });
}