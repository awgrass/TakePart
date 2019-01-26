function getXTicks(start, stop, amount){
    let ticks = [];
    let currValue = start;
    let step = (stop - start) / (amount - 1);
    for (var i = 0; i < amount; i++) {
        ticks.push(currValue + (step * i));
    }
    return ticks;
}


function createLine(x1, y1, x2, y2){
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "red");
    return line;
}

function createText(x, y, text){
    let textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute("x", x);
    textElement.setAttribute("y", y);
    textElement.textContent = text;
    return textElement;
}

function createCircle(x, y, r){
    let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", r);
    circle.setAttribute("fill", "black");
    return circle;
}

function createGraphTitle(title){
    return createText(60, 7.5, title);
}

function createXLabel(xCoord, text){
    let offset = 5; //offset to place label in the middle
    return createText(xCoord-offset, 115, text);
}

function convertRatioToRealY(ratio){
    return 100 - (ratio * 100) + 10;
}

function createStat1(courseName, callback){
    requestFileAsynchronously("stat1.html", function(caller){
        let svgElement = HTMLToElement(caller.responseText);
        getCourseByName(courseName, function(course){
            const numberOfPastEvents = course.statistics.length;
            const xTicks = getXTicks(15, 205, numberOfPastEvents);
            let dataPoints = [];
            let xLabelsAxis = svgElement.getElementsByClassName("x-labels")[0];
            //TODO: how can we now the dates are in the right order? sort?
            for (let i = 0; i < numberOfPastEvents; ++i){
                dataPoints.push(course.statistics[i].participants / course.statistics[i].registered);
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