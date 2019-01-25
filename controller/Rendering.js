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

function renderLogin(){
    requestFileAsynchronously('login.html', function(caller) {
        document.getElementById('root').innerHTML= caller.responseText;
        document.getElementById('submit-button').addEventListener('click', handleLogin);

    });
}



function renderLandingPage(){
    requestFileAsynchronously('landing-page.html', function(caller) {
        document.getElementById('root').innerHTML= caller.responseText;
        //document.getElementById('submit-button').addEventListener('click', handleLogin);
        requestFileAsynchronously('course-item.html', function(caller){
            let courseList = document.getElementById('course-list');
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

                    //createStat1("Mustersport");
                })
            });


        })


    });
}

