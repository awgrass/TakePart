window.onload = function(){
    let cookie = getCookie("session");
    if (cookie !== null){
        //TODO: check if user stored in cookie is in database
        let splittedCookie = cookie.split("|");
        let email = splittedCookie[0];
        let password = splittedCookie[1];
        authenticateUser(email, password, function(){
            if (auth.currentUser){
                renderLandingPage();
            }
        });
    }
    else{
        renderLogin();
    }

};

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


function renderLogin(){
    requestFileAsynchronously('login.html', function(caller) {
        document.getElementById('root').innerHTML= caller.responseText;
        document.getElementById('submit-button').addEventListener('click', handleLogin);

    });
}

function handleLogin(){
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let isChecked = document.getElementById('remember-me').checked;

    authenticateUser(email, password, function(){
        if (auth.currentUser){
            if(isChecked){
                //TODO: we need a better way to set the currentUser global variable...
                let cookieVal = email + "|" + password;
                let days = 7;
                setCookie("session", cookieVal, days);
            }
            getUserById(auth.currentUser.uid, renderLandingPage);
        } else {
            console.log("Authentication failed.");
        }
    });
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

function renderLandingPage(){
    requestFileAsynchronously('landing-page.html', function(caller) {
        document.getElementById('root').innerHTML= caller.responseText;
        //document.getElementById('submit-button').addEventListener('click', handleLogin);
        requestFileAsynchronously('course-item.html', function(caller){
            let courseList = document.getElementById('course-list');
            console.log(courseList);
            let itemTemplate = HTMLToElement(caller.responseText);
            getAllCourses(function(courses){
                courses.forEach(course => {
                    let item = itemTemplate.cloneNode(true);
                    let title = course.name;
                    let numParticipants = course.participants.length;
                    let nextDate = course.dates.sort()[course.dates.length - 1];

                    item.getElementsByClassName('course-title')[0].innerHTML = title;
                    item.getElementsByClassName('course-attendees')[0].innerHTML = numParticipants.toString();
                    item.getElementsByClassName('course-date')[0].innerHTML = secondsToDate(nextDate.seconds);

                    courseList.appendChild(item);
                })
            });


        })


    });
}

