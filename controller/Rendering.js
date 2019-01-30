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
        tryRemoveElementByID('info-container-' + itemCourseName);
        listItem.setAttribute("has-info-container", "no");
    }
}

function closeStatisticsContainer(listItem, itemCourseName){
    if (listItem.getAttribute("has-statistics-container") === "yes") {
        tryRemoveElementByID('statistics-container-' + itemCourseName);
        listItem.setAttribute("has-statistics-container", "no");
    }
}

function closeAddAttendeesContainer(listItem, itemCourseName){
    if (listItem.getAttribute("has-attendees-container") === "yes") {
        tryRemoveElementByID('add-attendees-container-' + itemCourseName);
        listItem.setAttribute("has-attendees-container", "no");
    }
}

function closeAddDatesContainer(listItem, itemCourseName){
    if (listItem.getAttribute("has-dates-container") === "yes") {
        tryRemoveElementByID('add-dates-container-' + itemCourseName);
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

function handleDragAndDrop(container, courseName) {
    //TODO: EMAIL statt NAME für die id, weil Namen doppelt vorkommen können
    let dropBox = getChildByClassName(container, "drop-box");
    let userList = getChildByClassName(container, "user-list");
    dropBox.addEventListener("dragover", handleOnDragOver);
    dropBox.setAttribute("id", "drop-box-" + courseName);
    dropBox.addEventListener("drop", handleOnDrop);
    userList.addEventListener("drop", handleOnDrop);
    userList.addEventListener("dragover", handleOnDragOver);
    userList.setAttribute("id", "user-list-" + courseName);
}

function renderAttendeesContainer(courseName, courseItemNode){
    requestFileAsynchronously("add-attendee-container.html", function (caller) {
        let attendeesContainer = HTMLToElement(caller.responseText);
        attendeesContainer.setAttribute("id", "add-attendees-container-" + courseName);

        let cancelButton = getChildByClassName(attendeesContainer, "back-adding-attendees");
        let okButton = getChildByClassName(attendeesContainer, "submit-adding-attendees");
        okButton.addEventListener("click", function(){
            dropBox = document.getElementById("drop-box-" + courseName);
            for(let child = dropBox.firstElementChild; child !== null; child=child.nextSibling){
                let userID = child.getAttribute("user-id");
                let userPath = getUserRefByID(userID);
                addParticipant(userPath,courseName);
                addCourseToUserByID(userID, getCourseRefBycourseName(courseName));
            }
            updateAttendeesCount(courseName, courseItemNode);
            closeContainers(courseItemNode, courseName, [closeAddAttendeesContainer]);
        });

        cancelButton.addEventListener("click", function () {
            closeContainers(courseItemNode, courseName, [closeAddAttendeesContainer]);
        });

        handleDragAndDrop(attendeesContainer, courseName);
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
                    tryRemoveElementByID("info-container-" + courseName);
                    courseItemNode.setAttribute("has-info-container", "no");
                });
            });
        });
    });
}

function updateAttendeesCount(courseName, courseItemNode){
    let courseAttendeesField = getChildByClassName(courseItemNode, "course-attendees");
    getCourseByName(courseName, function(course){
        courseAttendeesField.innerHTML = course.participants.length ? course.participants.length : 0;
    });

}

function getDateFromDateTimePicker(datetimepickerID){
    return new firebase.firestore.Timestamp($("[id='" + datetimepickerID + "']").data('DateTimePicker').getDate().unix(),0);
}

function initDatetimepicker(datetimepickerID){

    $("[id='" + datetimepickerID + "']").datetimepicker({
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
            //TODO: date should be in future!
            let newDate = getDateFromDateTimePicker(datetimepickerID);
            addDate(newDate, courseName);
            updateNextDate(courseName, courseItemNode);
            closeContainers(courseItemNode, courseName, [closeAddDatesContainer]);
        };
        insertAfter(datesContainer, courseItemNode);
        initDatetimepicker(datetimepickerID);
        courseItemNode.setAttribute("has-dates-container", "yes");
        tryRemoveElementByID("info-container-" + courseName);
        courseItemNode.setAttribute("has-info-container", "no");
    });
}

function updateNextDate(courseName, courseItemNode){
    let courseDateField = getChildByClassName(courseItemNode, "course-date");
    getCourseByName(courseName, function(course){
        let nextDate = course.dates[0];
        courseDateField.innerHTML = nextDate ? timestampToDate(nextDate) : "";
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
    let numParticipants = courseObject.participants === undefined
        ? courseObject.num
        : courseObject.participants.length;
    let nextDate = courseObject.dates === undefined
        ? courseObject.date
        : courseObject.dates.sort()[courseObject.dates.length - 1];

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
            startWorker();
            let profileField = genericCreateElement("p", ["right-elements"], [["id", "profile"]]);
            profileField.innerHTML = "Profil";
            let mobileProfileField = genericCreateElement("p", ["element"], [["id", "profileMobile"]]);
            mobileProfileField.innerHTML = "Profil";
            header.prepend(profileField);
            let mobileHeaderElement = document.getElementById("mobile-bar-elements");
            mobileHeaderElement.prepend(mobileProfileField);
            attachUserEventListenersToLandingPage();
        }
    });
}

function renderUserLandingPage(courseObjects) {
    let courseItemFile = "course-item-user-ready.html";
    requestFileAsynchronously(courseItemFile, function(caller){
        let courseList = document.getElementById('course-list');
        let courseContainerTemplate = HTMLToElement(caller.responseText);
        courseObjects.forEach(courseObj => {
            if (document.getElementById("list-item-" + courseObj.name) !== null) return;
            let courseContainer = initializeCourseContainerFromCourseObject(courseObj, courseContainerTemplate.cloneNode(true));
            let confirmationButton = getChildByClassName(courseContainer, "attendance-confirmation");
            confirmationButton.addEventListener("click", function(){
                updateStatistic(courseObj.name, courseObj.date, true);
                courseItemFile =  "course-item-user-accepted.html";
                requestFileAsynchronously(courseItemFile, function(caller){
                    tryRemoveElementByID("list-item-" + courseObj.name);
                    courseContainerTemplate = HTMLToElement(caller.responseText);
                    courseContainer = initializeCourseContainerFromCourseObject(courseObj, courseContainerTemplate.cloneNode(true));
                    courseList.appendChild(courseContainer);
                });

            });
            courseList.appendChild(courseContainer);
            addStatistic(courseObj.name, courseObj.date, courseObj.num);
        });
        closeOutdatedContainers(courseObjects);
    });
}

function getAllCurrentlyActiveCourseContainers(callback){
    getAllCourses(function(courses){
        let activeCourses = [];
        courses.forEach(course => {
            if (document.getElementById("list-item-" + course.name)){
                activeCourses.push(course);
            }
        });
        callback(activeCourses);
    });
}

function removeCourseContainerAndAllItsSubContainers(courseName){
    tryRemoveElementByID("list-item-" + courseName);
    tryRemoveElementByID("statistics-container-" + courseName);
    tryRemoveElementByID("info-container-" + courseName);
}

function closeOutdatedContainers(courseObjects){
    getAllCurrentlyActiveCourseContainers(function(activeCourses){
            activeCourses.forEach(activeCourse => {
                if (!courseListContainsCourse(courseObjects, activeCourse)){
                    removeCourseContainerAndAllItsSubContainers(activeCourse.name);
                }
        });
    });
}

function handleOnClickBurgerButton() {
    let mobileBar = document.getElementById("mobile-bar");
    if (mobileBar.style.display === "block") {
        mobileBar.style.display = "none";
    } else {
        mobileBar.style.display = "block";
    }
}

function renderAdminLandingPage(header){
    let courseList = document.getElementById("course-list");
    requestFileAsynchronously("add-course.html", function(caller){
        let addCourseContainer = HTMLToElement(caller.responseText);
        courseList.appendChild(addCourseContainer);
        let registerField = genericCreateElement("p", ["right-elements"], [["id", "register"]]);
        let mobileRegisterField = genericCreateElement("p", ["element"], [["id", "registerMobile"]]);
        mobileRegisterField.innerHTML = "Neue Registrierung";
        registerField.innerHTML = "Neue Registrierung";
        let mobileHeaderElement = document.getElementById("mobile-bar-elements");
        mobileHeaderElement.prepend(mobileRegisterField);
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
    document.getElementById("logoutMobile").addEventListener("click", handleLogout);
    document.getElementById("appName").addEventListener("click", renderLandingPageDistinctly);
    document.getElementById("burger-button").addEventListener("click", handleOnClickBurgerButton);
}

function attachAdminEventListenersToLandingPage(){
    attachCommonEventListenersToLandingPage();
    document.getElementById("register").addEventListener("click", renderRegistrationPage);
    document.getElementById("registerMobile").addEventListener("click", renderRegistrationPage);
    document.getElementById("add-course-p").addEventListener("click", renderCourseCreationContainer);
}

function attachUserEventListenersToLandingPage(){
    attachCommonEventListenersToLandingPage();
    document.getElementById("profile").addEventListener("click", renderProfilePage);
    document.getElementById("profileMobile").addEventListener("click", renderProfilePage);
}

function renderProfilePage(){
    document.getElementById("mobile-bar").style.display = "none";
    if (document.getElementById("user-profile")){
        return;
    }
    requestFileAsynchronously("profile-container.html", function(caller){
       let profileContainer = HTMLToElement(caller.responseText);
        hideCourseList();
        document.getElementById("main-container").appendChild(profileContainer);
       getUserById(auth.currentUser.uid, function(user){
           let nameField = getChildByClassName(profileContainer, "user-name");
           let emailField = getChildByClassName(profileContainer, "user-mail");
           nameField.innerHTML = user.firstName + " " + user.lastName;
           emailField.innerHTML = user.email;
           let imageTag = document.getElementById("avatar-image");
           storageRef.child("/images/" + auth.currentUser.uid + "/avatar.jpg").getDownloadURL().then(function(url) {
               imageTag.src = url;
           });
           document.getElementById("avatar-image-input").onchange = function(e){
               let file = e.target.files[0];
               let fileReader = new FileReader();

               fileReader.onload = function(e){
                   imageTag.src = e.target.result;
                   let imgRef = storageRef.child("/images/" + auth.currentUser.uid + "/avatar.jpg");
                   imgRef.put(file).then(function(snapshot) {
                       console.log('Uploaded a blob or file!');
                   });
               };
               fileReader.readAsDataURL(file);
           };
           document.getElementById("back-button-profile").addEventListener("click", handleBackButton);
       });
    });
}

function renderRegistrationPage(){
    document.getElementById("mobile-bar").style.display = "none";
    if (document.getElementById("registration-container")){
        return;
    }
    if (document.getElementById("course-creation-container")){
        tryRemoveElementByID("course-creation-container");
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
