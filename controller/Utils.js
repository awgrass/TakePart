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

function secondsToDate(seconds){
    let myDate = new Date( seconds *1000);
    return myDate.toLocaleDateString();
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function removeElementByID(id){
    document.getElementById(id).outerHTML = "";
}

function focusElement(id){
    window.location.hash = '#' + id;
}