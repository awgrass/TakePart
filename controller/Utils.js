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

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
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
