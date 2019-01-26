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


function renderInfoContainerContent(courseName){
    let infoContainer = document.getElementById("info-container-" + courseName);
    getCourseDataByCoursName(courseName, function(participants, timestamps){
        let attendeesList = infoContainer.getElementsByClassName("attendees-list-view")[0];
        participants.forEach(name => {
            addInfoContainerItem(attendeesList, ["attendees-list"], name);
        });
        let datesList = infoContainer.getElementsByClassName("dates-list-view")[0];
        timestamps.forEach(timestamp => {
            addInfoContainerItem(datesList, ["dates-list", "row"], timestampToDate(timestamp));
        });

    });
}

function addInfoContainerItem(list, classNameArray, value){
    let listEntry = document.createElement("li");
    classNameArray.forEach(className => {
        listEntry.classList.add(className);
    });
    let p = document.createElement("p");
    p.innerHTML = value;
    listEntry.appendChild(p);
    list.appendChild(listEntry);
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
        renderInfoContainerContent(courseName);
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

function createListCourseElement(courseObject, elementToInitialize){
    let title = courseObject.name;
    let numParticipants = courseObject.participants.length;
    let nextDate = courseObject.dates.sort()[courseObject.dates.length - 1];

    let titleParagraph = elementToInitialize.getElementsByClassName('course-title')[0];
    titleParagraph.addEventListener("click", renderInfoContainer);
    titleParagraph.innerHTML = title;

    elementToInitialize.getElementsByClassName('course-attendees')[0].innerHTML = numParticipants.toString();
    elementToInitialize.getElementsByClassName('course-date')[0].innerHTML = timestampToDate(nextDate);

    let button = elementToInitialize.getElementsByClassName('statistics-button')[0];
    button.setAttribute('button-of', title);
    button.addEventListener("click", renderStatisticsContainer);

    let id = "list-item-" + title;
    elementToInitialize.setAttribute("id", id);
    elementToInitialize.setAttribute("has-info-container", "no");
    elementToInitialize.setAttribute("course", title);

    return elementToInitialize;
}

function renderCreationPage(){
    if (document.getElementById("creation-container")){
        return;
    }
    requestFileAsynchronously("creation-container.html", function(caller){
        document.getElementById("course-list").style.display = "none";
        let registerBox = HTMLToElement(caller.responseText);
        document.getElementById("main-container").appendChild(registerBox);
    })
}

function renderLandingPage(){
    requestFileAsynchronously('landing-page.html', function(caller) {
        document.getElementById('root').innerHTML= caller.responseText;
        document.getElementById("logout").addEventListener("click", handleLogout);
        document.getElementById("register").addEventListener("click", renderCreationPage);
        requestFileAsynchronously('course-item.html', function(caller){
            let courseList = document.getElementById('course-list');
            let itemTemplate = HTMLToElement(caller.responseText);
            getAllCourses(function(courses){
                console.log(courses);
                courses.forEach(course => {
                    let item = createListCourseElement(course, itemTemplate.cloneNode(true));
                    courseList.appendChild(item);
                });
            });
        });
    });
}
