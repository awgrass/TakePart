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
    if (listItem.getAttribute("has-info-container") === "yes") {
        removeElementByID('info-container-' + itemCourseName);
        listItem.setAttribute("has-info-container", "no");
    }
}

function closeStatisticsContainer(listItem, itemCourseName){
    if (listItem.getAttribute("has-statistics-container") === "yes") {
        removeElementByID('statistics-container-' + itemCourseName);
        listItem.setAttribute("has-statistics-container", "no");
    }
}

function closeAddAttendeesContainer(listItem, itemCourseName){
    if (listItem.getAttribute("has-attendees-container") === "yes") {
        removeElementByID('add-attendees-container-' + itemCourseName);
        listItem.setAttribute("has-attendees-container", "no");
    }
}

function closeAddDatesContainer(listItem, itemCourseName){
    if (listItem.getAttribute("has-dates-container") === "yes") {
        removeElementByID('add-dates-container-' + itemCourseName);
        listItem.setAttribute("has-dates-container", "no");
    }
}

function closeContainers(listItem, itemCourseName, closeContainerFunctions){
    closeContainerFunctions.forEach(func => func(listItem, itemCourseName));
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


function handleOnDragStart(event) {
    this.style.opacity = '0.4';
    event.dataTransfer.setData('text', event.target.id);
}

function handleOnDrop(event) {
    event.preventDefault();
    let data = event.dataTransfer.getData("text");
    let element = document.getElementById(data);
    let courseName = data.split("to-");
    element.style.opacity = '1';

    let eventId = event.target.getAttribute("id");
    if(eventId.includes("drop-box") && eventId.includes(courseName[1])) {
        event.target.appendChild(element);
    } else if (eventId.includes("user-list") && eventId.includes(courseName[1])) {
        event.target.appendChild(element);
    }
}

function handleOnDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

function addAttendees(list, classNameArray, value, courseName, id) {
    let listEntry = document.createElement("li");
    let userName = value.replace(/\s/g,"");
    classNameArray.forEach(className => {
        listEntry.classList.add(className);
    });
    let i = document.createElement("i");
    i.setAttribute("class", "fas fa-arrows-alt");

    let p = document.createElement("p");
    p.innerHTML = value;
    p.setAttribute("class", "user-elements");

    let div = document.createElement("div");
    div.setAttribute("class", "user-name-container");
    div.appendChild(p);
    div.appendChild(i);
    listEntry.setAttribute("draggable", "true");

    if(id){
        listEntry.setAttribute("user-id", id);
    }
    listEntry.setAttribute("id", "add-" + userName + "-to-" + courseName);
    listEntry.appendChild(div);
    listEntry.addEventListener("dragstart", handleOnDragStart);

    list.appendChild(listEntry);
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

function renderAttendeesContainer(courseName, courseItemNode){
    requestFileAsynchronously("add-attendee-container.html", function (caller) {
        let attendeesContainer = HTMLToElement(caller.responseText);
        attendeesContainer.setAttribute("id", "add-attendees-container-" + courseName);

        let okButton = getChildByClassName(attendeesContainer, "submit-adding-attendees");
        okButton.addEventListener("click", function(){
            dropBox = document.getElementById("drop-box-" + courseName);
            for(let child = dropBox.firstChild.nextSibling; child !== null; child=child.nextSibling){
                let userID = child.getAttribute("user-id");
                let userPath = getUserRefByID(userID);
                addParticipant(userPath,courseName);
                closeContainers(courseItemNode, courseName, [closeAddAttendeesContainer]);
            }
        });

        let dropBox = getChildByClassName(attendeesContainer, "drop-box");
        let userList = getChildByClassName(attendeesContainer, "user-list");
        dropBox.addEventListener("dragover", handleOnDragOver);
        dropBox.setAttribute("id", "drop-box-" + courseName);
        dropBox.addEventListener("drop", handleOnDrop);
        userList.addEventListener("drop", handleOnDrop);
        userList.addEventListener("dragover", handleOnDragOver);
        userList.setAttribute("id", "user-list-" + courseName);

        getChildByClassName(attendeesContainer, "course-name").innerHTML = courseName;
        let userListElement = getChildByClassName(attendeesContainer, "user-list");
        getCourseByName(courseName, function (course) {
            getObjectListFromRefList(course.participants, function (participants) {
                getUsers(function (users) {
                    users.forEach(user => {
                        if (!participants.some(participant => isSameUser(participant, user))) {
                            let userName = user.firstName + " " + user.lastName;
                            addAttendees(userListElement, ["user-list-element"], userName, courseName, user.uID);
                        }
                    });
                    insertAfter(attendeesContainer, courseItemNode);
                    courseItemNode.setAttribute("has-attendees-container", "yes");
                    removeElementByID("info-container-" + courseName);
                    courseItemNode.setAttribute("has-info-container", "no");
                });
            });
        });
    });
}

function getDateFromDateTimePicker(datetimepickerID){
    return new firebase.firestore.Timestamp($("#"+datetimepickerID).data('DateTimePicker').getDate().unix(),0);
}

function initDatetimepicker(datetimepickerID){
    $("#"+datetimepickerID).datetimepicker({
        format: 'DD/MM/YYYY HH:mm',
    });
}

function renderDatesContainer(courseName, courseItemNode){
    requestFileAsynchronously("add-dates-container.html", function(caller){
        let datesContainer = HTMLToElement(caller.responseText);
        let datesContainerID = "add-dates-container-" + courseName;
        datesContainer.setAttribute("id", datesContainerID);
        let dateForm = getChildByClassName(datesContainer, "create-date");
        let datetimepickerID = "datetimepicker-" + courseName;
        dateForm.prepend(createAddDateField(datetimepickerID));
        dateForm.onsubmit = function(e){
            e.preventDefault();
            let newDate = getDateFromDateTimePicker(datetimepickerID);
            addDate(newDate, courseName);
            closeContainers(courseItemNode, courseName, [closeAddDatesContainer]);
        };
        insertAfter(datesContainer, courseItemNode);
        initDatetimepicker(datetimepickerID);
        courseItemNode.setAttribute("has-dates-container", "yes");
        removeElementByID("info-container-" + courseName);
        courseItemNode.setAttribute("has-info-container", "no");
    });
}

function createAddDateField(inputID){
    let outerDiv = genericCreateElement("div", ["form-group"], []);
    let innerDiv = genericCreateElement("div", ["input-group", "date"], []);
    let input = genericCreateElement("input", ["form-control", "form_datetime"], [["id", inputID]]);
    let outerSpan = genericCreateElement("span", ["input-group-addon"], []);
    let innerSpan = genericCreateElement("span", ["glyphicon", "glyphicon-calendar"], []);
    outerDiv.appendChild(innerDiv);
    innerDiv.appendChild(input);
    outerSpan.appendChild(innerSpan);
    innerDiv.appendChild(outerSpan);
    return outerDiv;
}

function handleAddDate(e){

}

function renderInfoContainer(e){
    let courseName = e.target.innerHTML;
    let courseItemNode = document.getElementById("list-item-" + courseName);
    let courseNameOfCurrentItem = courseItemNode.getAttribute("course");
    if (courseItemNode.getAttribute("has-info-container") === "yes"){
        closeInfoContainer(courseItemNode, courseNameOfCurrentItem);
        return;
    }
    closeContainers(courseItemNode, courseNameOfCurrentItem,[
        closeStatisticsContainer,
        closeAddAttendeesContainer,
        closeAddDatesContainer
    ]);
    requestFileAsynchronously('info-container.html', function(caller){
        let infoContainer = HTMLToElement(caller.responseText);
        getUserById(auth.currentUser.uid, function(user){
            let attendeesField = getChildByClassName(infoContainer, "add-attendees");
            let datesField = getChildByClassName(infoContainer, "add-dates");
            if(user.isAdmin){
                let plusIcon1 = genericCreateElement("i", ["fas", "fa-plus-circle", "plus-icon-info"], []);
                let plusIcon2 = genericCreateElement("i", ["fas", "fa-plus-circle", "plus-icon-info"], []);

                let attendeesList = getChildByClassName(infoContainer, "attendees-list");
                attendeesList.prepend(plusIcon1);
                let datesList = getChildByClassName(infoContainer, "dates-list");
                datesList.prepend(plusIcon2);
                attendeesField.innerHTML = "Teilnehmer hinzufügen";
                datesField.innerHTML = "Termin hinzufügen";
                attachInfoContainerEventListeners(infoContainer, courseNameOfCurrentItem, courseItemNode);
            }
            else{
                attendeesField.innerHTML = "Teilnehmer";
                datesField.innerHTML = "Termine";
            }
            infoContainer.setAttribute("id", "info-container-" + courseNameOfCurrentItem);
            insertAfter(infoContainer, courseItemNode);
            courseItemNode.setAttribute("has-info-container", "yes");
            renderInfoContainerContent(courseName);
        });
    });
}

function attachInfoContainerEventListeners(infoContainer, courseNameOfCurrentItem, courseItemNode){
    getChildByClassName(infoContainer, "attendees-list").addEventListener("click", function(){
        renderAttendeesContainer(courseNameOfCurrentItem, courseItemNode);
    }, {once: true});

    getChildByClassName(infoContainer, "dates-list").addEventListener("click", function(){
        renderDatesContainer(courseNameOfCurrentItem, courseItemNode);
    }, {once: true});
}

function renderStatisticsContainer(e){
    let courseNameOfCurrentItem = e.target.getAttribute('button-of');
    let listItem = document.getElementById("list-item-" + courseNameOfCurrentItem);
    if(listItem.getAttribute("has-statistics-container") === "yes"){
        closeStatisticsContainer(listItem, courseNameOfCurrentItem);
        return;
    }
    closeContainers(listItem, courseNameOfCurrentItem,[
        closeInfoContainer,
        closeAddAttendeesContainer,
        closeAddDatesContainer
    ]);
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

function initializeCourseContainerFromCourseObject(courseObject, elementToInitialize){
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
        document.getElementById('root').innerHTML = caller.responseText;
        let header = document.getElementById("header-right");
        if (isAdmin){
            renderAdminLandingPage(header);
        }
        else{
            renderUserLandingPage(header);
        }
    });
}

function renderUserLandingPage(header){
    let profileField = genericCreateElement("p", ["right-elements"], [["id", "profile"]]);
    profileField.innerHTML = "Profil";
    header.prepend(profileField);
    attachUserEventListenersToLandingPage();
    let courseItemFile = "course-item-user-ready.html";
    requestFileAsynchronously(courseItemFile, function(caller){
        let courseList = document.getElementById('course-list');
        let courseContainerTemplate = HTMLToElement(caller.responseText);
        getCoursesOfCurrentUser(auth.currentUser.uid, function(courseObjects){
            courseObjects.forEach(courseObj => {
                let courseContainer = initializeCourseContainerFromCourseObject(courseObj, courseContainerTemplate.cloneNode(true));
                courseList.appendChild(courseContainer);
            });
        });
    });
}

function renderAdminLandingPage(header){
    let courseList = document.getElementById("course-list");
    requestFileAsynchronously("add-course.html", function(caller){
        let addCourseContainer = HTMLToElement(caller.responseText);
        courseList.appendChild(addCourseContainer);
        let registerField = genericCreateElement("p", ["right-elements"], [["id", "register"]]);
        registerField.innerHTML = "Neue Registrierung";
        header.prepend(registerField);
        attachAdminEventListenersToLandingPage();
        let courseItemFile = "course-item-admin.html";
        requestFileAsynchronously(courseItemFile, function(caller) {
            let courseList = document.getElementById('course-list');
            let courseContainerTemplate = HTMLToElement(caller.responseText);
            getAllCourses(function(courseObjects){
                courseObjects.forEach(courseObj => {
                    let courseContainer = initializeCourseContainerFromCourseObject(courseObj, courseContainerTemplate.cloneNode(true));
                    courseList.appendChild(courseContainer);
                });
            });
        });
    });
}

function attachCommonEventListenersToLandingPage(){
    document.getElementById("logout").addEventListener("click", handleLogout);
    document.getElementById("appName").addEventListener("click", renderLandingPageDistinctly);
}

function attachAdminEventListenersToLandingPage(){
    attachCommonEventListenersToLandingPage();
    document.getElementById("register").addEventListener("click", renderRegistrationPage);
    document.getElementById("add-course-p").addEventListener("click", renderCourseCreationContainer);
}

function attachUserEventListenersToLandingPage(){
    attachCommonEventListenersToLandingPage();
    document.getElementById("profile").addEventListener("click", renderProfilePage);
}

function renderProfilePage(){
    if (document.getElementById("user-profile")){
        return;
    }
    requestFileAsynchronously("profile-container.html", function(caller){
       let profileContainer = HTMLToElement(caller.responseText);
       getUserById(auth.currentUser.uid, function(user){
           let nameField = getChildByClassName(profileContainer, "user-name");
           let emailField = getChildByClassName(profileContainer, "user-mail");
           nameField.innerHTML = user.firstName + " " + user.lastName;
           emailField.innerHTML = user.email;
           hideCourseList();
           document.getElementById("main-container").appendChild(profileContainer);
           //document.getElementById("back-button-profile").addEventListener("click", handleBackButton);
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
        let registerContainer = HTMLToElement(caller.responseText);
        hideCourseList();
        document.getElementById("main-container").appendChild(registerContainer);
        document.getElementById("registration-form").onsubmit = handleRegister;
        document.getElementById("back-button-registration").addEventListener("click", handleBackButton);
    })
}

function hideCourseList(){
    hideElementWithoutSpaceUse("course-list");
}
