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

function HTMLToElement(html) {
    let template = document.createElement('template');
    //html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

function timestampToDate(timestamp){
    let myDate = new Date( timestamp.seconds *1000);
    return myDate.toLocaleDateString();
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function removeElementByID(id){
    document.getElementById(id).outerHTML = "";
}

function disableButton(buttonID){
    document.getElementById("buttonID").disabled = true;
}

function focusElement(id){
    window.location.hash = '#' + id;
}

//attention: only call this function for unique class names!
function getChildByClassName(node, classNameOfChild){
    return node.getElementsByClassName(classNameOfChild)[0];
}

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

function isSameUser(user1, user2){
    return user1.uID === user2.uID;
}

function hideElementWithoutSpaceUse(id){
    document.getElementById(id).style.display = "none";
}

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