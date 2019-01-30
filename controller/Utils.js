/*

Function: requestFileAsynchronously
Http request for getting the corresponding file.

Parameters:
{String} file - Name of teh file which is requested
{Function} callback - callback function which is called within

*/
function requestFileAsynchronously(file, callback){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', file, true);
    xhr.onreadystatechange = function(){
        if ((this.readyState === 4) && (this.status === 200)){
            callback(this);
        }
    };
    xhr.send();
}

/*

Function: HTMLToElement
Converts HTML to a DOM element.

Parameters:
{String} html -  HTML representing a node
*/
function HTMLToElement(html) {
    let template = document.createElement('template');
    //html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

/*

Function: timestampToDate
Converts a Firestore Timestamp to a Date object.

Parameters:
{Timestamp} timestamp - A Firestore Timestamp
*/
function timestampToDate(timestamp){
    let myDate = new Date( timestamp.seconds *1000);
    return myDate.toLocaleDateString();
}

/*

Function: insertAfter
Inserts a node after another in the DOM.

Parameters:
{HTMLElement} newNode - Node to insert
{HTMLElement} referenceNode - Node after which newNode should be inserted
*/
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

/*

Function: tryRemoveElementByID
Removes element by ID, if it is in the DOM.

Parameters:
{String} id - ID of the DOM element to remove
*/
function tryRemoveElementByID(id){
    if (document.getElementById(id)){
        document.getElementById(id).outerHTML = "";
    }

}


/*

Function: getChildByClassName
Gets a child by its class name.
Attention: only call this function for unique class names!

Parameters:
{HTMLElement} node - the parent node
{String} classNameOfChild - class name of child
*/
function getChildByClassName(node, classNameOfChild){
    return node.getElementsByClassName(classNameOfChild)[0];
}



/*

Function: getObjectListFromRefList
Converts a list of references to a list of objects.

Parameters:
{Array} refList - contains the references to the objects
{Function} callback - callback
*/
function getObjectListFromRefList(refList, callback){
    let objectList = [];

    refList.forEach(ref => {
        ref.get().then(function(doc){
            objectList.push(doc.data());
            if (objectList.length === refList.length){
                callback(objectList);
            }
        })
    });
    if (refList.length === 0){
        callback(objectList);
    }
}


/*

Function: isSameUser
Checks if two user objects refer to the same user.

Parameters:
{User} user1 - first user
{User} user2 - second user
*/
function isSameUser(user1, user2){
    return user1.uID === user2.uID;
}


/*

Function: hideElementWithoutSpaceUse
Generic function for hiding a DOM element.

Parameters:
{String} id - ID of the DOM element
*/
function hideElementWithoutSpaceUse(id){
    document.getElementById(id).style.display = "none";
}


/*

Function: genericCreateElement
Generic function for the creation of a DOM element.

Parameters:
{String} tagName - tag name
{Array} classNames - list of class names
{Array} attributeTuples - list of lists of key value pairs
*/
function genericCreateElement(tagName, classNames, attributeTuples){
    let element = document.createElement(tagName);
    if(classNames){
        classNames.forEach(className => {element.classList.add(className);});
    }
    if(attributeTuples){
        attributeTuples.forEach(attributeTuple => {element.setAttribute(attributeTuple[0], attributeTuple[1]);});
    }
    return element;
}


/*

Function: courseListContainsCourse
Function for checking if a list of course objects contains a particular course.

Parameters:
{Array} courseList - list of courses
{Course} courseToCheck - the course to check
*/
function courseListContainsCourse(courseList, courseToCheck){
    let contains = false;
    courseList.forEach(course => {
        if (course.name === courseToCheck.name){
            contains = true;
        }
    });
    return contains;
}