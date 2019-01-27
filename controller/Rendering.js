window.onload = function(){
    let cookie = getCookie("session");
    if (cookie !== null){
        //TODO: check if user stored in cookie is in database
        let splittedCookie = cookie.split("|");
        let email = splittedCookie[0];
        let password = splittedCookie[1];
        authenticateUser(email, password, function(){
            renderLandingPageDistinctly();
        });
    }
    else{
        renderLogin();
    }
};

function renderLandingPageDistinctly(){
    getUserById(auth.currentUser.uid, function(user){
        console.log(user);
        renderLandingPage(user.isAdmin);
    });
}

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

function closeAddAttendeeContainer(listItem, itemCourseName){
    removeElementByID('add-attendees-container-' + itemCourseName);
    listItem.setAttribute("has-attendees-container", "no");
}

function closeDatesAddDatesContainer(listItem, itemCourseName){
    removeElementByID('add-dates-container-' + itemCourseName);
    listItem.setAttribute("has-dates-container", "no");
}

function renderInfoContainerContent(courseName){
    let infoContainer = document.getElementById("info-container-" + courseName);
    getCourseDataByCoursName(courseName, function(participants, timestamps){
        let attendeesList = infoContainer.getElementsByClassName("attendees-list-view")[0];
        participants.forEach(name => {
            genericAddListItem(attendeesList, ["attendees-list"], name, null, false);
        });
        let datesList = infoContainer.getElementsByClassName("dates-list-view")[0];
        timestamps.forEach(timestamp => {
            genericAddListItem(datesList, ["dates-list", "row"], timestampToDate(timestamp), null, false);
        });

    });
}

function genericAddListItem(list, classNameArray, value, id, isDraggable){
    let listEntry = document.createElement("li");
    classNameArray.forEach(className => {
        listEntry.classList.add(className);
    });
    let p = document.createElement("p");
    p.innerHTML = value;
    if (isDraggable){
        listEntry.setAttribute("draggable", "true");
    }
    if(id){
        listEntry.setAttribute("user-id", id);
    }
    listEntry.appendChild(p);
    list.appendChild(listEntry);
}


function handleAddDates(courseName){
}

function renderAttendeesContainer(attendeesContainer, courseName, courseItemNode){

    getChildByClassName(attendeesContainer, "course-name").innerHTML = courseName;
    let userListElement = getChildByClassName(attendeesContainer, "user-list");
    // 1)get course object
    getCourseByName(courseName, function(course){
        // 2)get all participants of the course
        getObjectListFromRefList(course.participants, function(participants){
            // 3)get all users
            getUsers(function(users){
                users.forEach(user => {
                    if (!participants.some(participant => isSameUser(participant, user))){
                        let userName = user.firstName + " " + user.lastName;
                        // 4)add user difference between 3) and 2) to attendeesContainer
                        genericAddListItem(userListElement, ["user-list-element"], userName, user.uID, true);
                    }
                });

                insertAfter(attendeesContainer, courseItemNode);
                courseItemNode.setAttribute("has-attendees-container", "yes");
                removeElementByID("info-container-" + courseName);
                courseItemNode.setAttribute("has-info-container", "no");
            });

        });
    });
}

function renderDatesContainer(datesContainer, courseName, courseItemNode){
    //getChildByClassName(datesContainer, "form-group");
    insertAfter(datesContainer, courseItemNode);
    courseItemNode.setAttribute("has-dates-container", "yes");
    removeElementByID("info-container-" + courseName);
    courseItemNode.setAttribute("has-info-container", "no");
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
    if (courseItemNode.getAttribute("has-attendees-container") === "yes"){
        closeAddAttendeeContainer(courseItemNode, courseNameOfCurrentItem);
    }
    if (courseItemNode.getAttribute("has-dates-container") === "yes"){
        closeDatesAddDatesContainer(courseItemNode, courseNameOfCurrentItem);
    }

    requestFileAsynchronously('info-container.html', function(caller){
        let infoContainer = HTMLToElement(caller.responseText);
        infoContainer.setAttribute("id", "info-container-" + courseNameOfCurrentItem);
        insertAfter(infoContainer, courseItemNode);
        courseItemNode.setAttribute("has-info-container", "yes");
        //add-attendeee
        getChildByClassName(infoContainer, "attendees-list").addEventListener("click", function(){
            requestFileAsynchronously("add-attendee-container.html", function(caller){
                let attendeesContainer = HTMLToElement(caller.responseText);
                attendeesContainer.setAttribute("id", "add-attendees-container-" + courseNameOfCurrentItem);
                renderAttendeesContainer(attendeesContainer, courseNameOfCurrentItem, courseItemNode);

            });
        }, {once: true});
        //add-date
        getChildByClassName(infoContainer, "dates-list").addEventListener("click", function(){
            requestFileAsynchronously("add-dates-container.html", function(caller){
                let datesContainer = HTMLToElement(caller.responseText);
                datesContainer.setAttribute("id", "add-dates-container-" + courseNameOfCurrentItem);
                renderDatesContainer(datesContainer, courseNameOfCurrentItem, courseItemNode);
            });
        }, {once: true});
        renderInfoContainerContent(courseName);
    });
}

function renderStatisticsContainer(e){
    let courseNameOfCurrentItem = e.target.getAttribute('button-of');
    let listItem = document.getElementById("list-item-" + courseNameOfCurrentItem);
    if(listItem.getAttribute("has-statistics-container") === "yes"){
        closeStatisticsContainer(listItem, courseNameOfCurrentItem);
        return;
    }
    if(listItem.getAttribute("has-info-container") === "yes"){
        closeInfoContainer(listItem, courseNameOfCurrentItem);
    }
    if (listItem.getAttribute("has-attendees-container") === "yes"){
        closeAddAttendeeContainer(listItem, courseNameOfCurrentItem);
    }
    if (listItem.getAttribute("has-dates-container") === "yes"){
        closeDatesAddDatesContainer(listItem, courseNameOfCurrentItem);
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

function createListCourseElement(courseObject, elementToInitialize){
    console.log(courseObject);
    let title = courseObject.name;
    let numParticipants = courseObject.participants.length;
    let nextDate = courseObject.dates.sort()[courseObject.dates.length - 1];

    let titleParagraph = elementToInitialize.getElementsByClassName('course-title')[0];
    titleParagraph.addEventListener("click", renderInfoContainer);
    titleParagraph.innerHTML = title;

    elementToInitialize.getElementsByClassName('course-attendees')[0].innerHTML = numParticipants.toString();
    if(nextDate){
        elementToInitialize.getElementsByClassName('course-date')[0].innerHTML = timestampToDate(nextDate);
    }

    let button = elementToInitialize.getElementsByClassName('statistics-button')[0];
    button.setAttribute('button-of', title);
    button.addEventListener("click", renderStatisticsContainer);

    let id = "list-item-" + title;
    elementToInitialize.setAttribute("id", id);
    elementToInitialize.setAttribute("has-info-container", "no");
    elementToInitialize.setAttribute("course", title);

    return elementToInitialize;
}

function handleBackButton(e){
    e.target.removeEventListener("click", handleBackButton);
    getUserById(auth.currentUser.uid, function(user){
        renderLandingPage(user.isAdmin);
    });
}

function renderCourseCreationContainer(){
    if (document.getElementById("course-creation-container")){
        return;
    }
    requestFileAsynchronously("course-creation-container.html", function(caller){
        let courseCreationContainer = HTMLToElement(caller.responseText);
        hideAddCourseContainer();
        document.getElementById("main-container").prepend(courseCreationContainer);
        document.getElementById("course-creation-form").onsubmit = handleCourseCreation;
        document.getElementById("back-button-course-creation").addEventListener("click", handleBackButton);

    });
}

function handleCourseCreation(e){
    e.preventDefault();
    let courseTitle = document.getElementById("course-title").value;
    createCourse(courseTitle, [], [], function(){
        getUserById(auth.currentUser.uid, function(user){
            renderLandingPage(user.isAdmin);
        });

    });
}

function hideAddCourseContainer(){
    document.getElementById("add-course").style.display = "none";
}

function renderLandingPage(isAdmin){
    requestFileAsynchronously('landing-page.html', function(caller) {
        document.getElementById('root').innerHTML= caller.responseText;
        document.getElementById("logout").addEventListener("click", handleLogout);
        document.getElementById("register").addEventListener("click", renderRegistrationPage);
        document.getElementById("appName").addEventListener("click", renderLandingPageDistinctly);
        document.getElementById("add-course-p").addEventListener("click", renderCourseCreationContainer);
        let courseItemFile = isAdmin ? "course-item-admin.html" : "course-item-user.html";
        requestFileAsynchronously(courseItemFile, function(caller){
            let courseList = document.getElementById('course-list');
            let itemTemplate = HTMLToElement(caller.responseText);
            if(isAdmin){
                getAllCourses(function(courses){
                    courses.forEach(course => {
                        let item = createListCourseElement(course, itemTemplate.cloneNode(true));
                        courseList.appendChild(item);
                    });
                });
            }
            else{
                getCoursesOfCurrentUser(auth.currentUser.uid, function(courses){
                    console.log(courses);
                    courses.forEach(course => {
                        let item = createListCourseElement(course, itemTemplate.cloneNode(true));
                        courseList.appendChild(item);
                    });
                });
            }

        });
    });
}

function renderRegistrationPage(){
    if (document.getElementById("registration-container")){
        return;
    }
    if (document.getElementById("course-creation-container")){
        removeElementByID("course-creation-container");
    }
    requestFileAsynchronously("registration-container.html", function(caller){
        hideCourseList();
        let registerBox = HTMLToElement(caller.responseText);
        document.getElementById("main-container").appendChild(registerBox);
        document.getElementById("registration-form").onsubmit = handleRegister;
        document.getElementById("back-button-registration").addEventListener("click", handleBackButton);
    })
}

function hideCourseList(){
    document.getElementById("course-list").style.display = "none";
}
