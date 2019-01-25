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


function renderInfoContainer(e){
    let courseName = e.target.innerHTML;
    let courseItemNode = document.getElementById("list-item-" + courseName);
    let courseNameOfCurrentItem = courseItemNode.getAttribute("course");
    if (courseItemNode.getAttribute("has-info-container") === "yes"){
        closeInfoContainer(courseItemNode, courseNameOfCurrentItem);
        return;
    }
    if (courseItemNode.getAttribute("has-statistics-container") === "yes"){
        closeStatisticsContainer(courseItemNode, courseNameOfCurrentItem);
    }
    requestFileAsynchronously('info-container.html', function(caller){
        let infoContainer = HTMLToElement(caller.responseText);
        infoContainer.setAttribute("id", "info-container-" + courseNameOfCurrentItem);
        insertAfter(infoContainer, courseItemNode);
        courseItemNode.setAttribute("has-info-container", "yes");
    });
}


function renderStatisticsContainer(e){
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
            //focusElement('statistics-container-' + courseNameOfCurrentItem);
        });

    });
}

function createCourseItem(courseObject, itemTemplate){
    let title = courseObject.name;
    let numParticipants = courseObject.participants.length;
    let nextDate = courseObject.dates.sort()[courseObject.dates.length - 1];

    let titleParagraph = itemTemplate.getElementsByClassName('course-title')[0];
    titleParagraph.addEventListener("click", renderInfoContainer);
    titleParagraph.innerHTML = title;

    itemTemplate.getElementsByClassName('course-attendees')[0].innerHTML = numParticipants.toString();
    itemTemplate.getElementsByClassName('course-date')[0].innerHTML = secondsToDate(nextDate.seconds);

    let button = itemTemplate.getElementsByClassName('statistics-button')[0];
    button.setAttribute('button-of', title);
    button.addEventListener("click", renderStatisticsContainer);

    let id = "list-item-" + title;
    itemTemplate.setAttribute("id", id);
    itemTemplate.setAttribute("has-info-container", "no");
    itemTemplate.setAttribute("course", title);
    //itemTemplate.addEventListener("click", renderInfoContainer);

    return itemTemplate;
}

function renderLandingPage(){
    requestFileAsynchronously('landing-page.html', function(caller) {
        document.getElementById('root').innerHTML= caller.responseText;
        document.getElementById("logout").addEventListener("click", handleLogout);
        //document.getElementById('submit-button').addEventListener('click', handleLogin);
        requestFileAsynchronously('course-item.html', function(caller){
            let courseList = document.getElementById('course-list');
            let itemTemplate = HTMLToElement(caller.responseText);
            getAllCourses(function(courses){
                console.log(courses);
                courses.forEach(course => {
                    let item = createCourseItem(course, itemTemplate.cloneNode(true));
                    courseList.appendChild(item);
                })
            });

        });


    });
}

