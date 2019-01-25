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

function closeInfoContainer(listItem, itemCourseName){
    removeElementByID('info-container-' + itemCourseName);
    listItem.setAttribute("has-info-container", "no");
}

function closeStatisticsContainer(listItem, itemCourseName){
    removeElementByID('statistics-container-' + itemCourseName);
    listItem.setAttribute("has-statistics-container", "no");
}

//TODO: kind of a hack...
function renderInfoContainer(e){
    let courseNameOfCurrentItem = e.target.getAttribute("course");
    if (e.target.getAttribute("has-info-container") === "yes"){
        closeInfoContainer(e.target, courseNameOfCurrentItem);
        return;
    }
    if (e.target.getAttribute("has-statistics-container") === "yes"){
        closeStatisticsContainer(e.target, courseNameOfCurrentItem);
    }
    requestFileAsynchronously('info-container.html', function(caller){
        let infoContainer = HTMLToElement(caller.responseText);
        infoContainer.setAttribute("id", "info-container-" + courseNameOfCurrentItem);
        insertAfter(infoContainer, e.target);
        e.target.setAttribute("has-info-container", "yes");
        focusElement('info-container');
    });
}


function handleStatisticsButtonClick(e){
    e.stopPropagation();
    let courseNameOfCurrentItem = e.target.getAttribute('button-of');
    let listItem = document.getElementById("list-item-" + courseNameOfCurrentItem);
    if(listItem.getAttribute("has-statistics-container") === "yes"){
        closeStatisticsContainer(listItem, courseNameOfCurrentItem);
        return;
    }
    if(listItem.getAttribute("has-info-container") === "yes"){
        closeInfoContainer(listItem, courseNameOfCurrentItem);
    }

    requestFileAsynchronously('statistics-container.html', function(caller){
        let statisticsContainer = HTMLToElement(caller.responseText);
        createStat1(courseNameOfCurrentItem, function(statistic1){
            statisticsContainer.appendChild(statistic1);
            statisticsContainer.setAttribute('id', "statistics-container-" + courseNameOfCurrentItem);
            insertAfter(statisticsContainer, document.getElementById('list-item-' + courseNameOfCurrentItem));
            listItem.setAttribute("has-statistics-container", "yes");
        });

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

                    let button = item.getElementsByClassName('statistics-button')[0];
                    button.setAttribute('button-of', title);
                    button.addEventListener("click", handleStatisticsButtonClick);

                    let id = "list-item-" + title;
                    item.setAttribute("id", id);
                    item.setAttribute("has-info-container", "no");
                    item.setAttribute("course", title);
                    item.addEventListener("click", renderInfoContainer);
                    courseList.appendChild(item);

                    //createStat1("Mustersport");
                })
            });

        });


    });
}

