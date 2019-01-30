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


/*

Function: renderLandingPageDistinctly
Renders the landing page distinctly.
Calls the renderLandingPage function.

 */
function renderLandingPageDistinctly(){
    getUserById(auth.currentUser.uid, function(user){
        console.log(user);
        renderLandingPage(user.isAdmin);
    });
}


// Function: renderLogin
// Loads the login.html in the root element of the index.html.
// Attaches the EventListener for the submit button.
function renderLogin()
{
    requestFileAsynchronously('login.html', function(caller) {
        document.getElementById('root').innerHTML= caller.responseText;
        document.getElementById('submit-button').addEventListener('click', handleLogin);

    });
}


/*

Function: closeInfoContainer
Closes the info container by checking if the container has attribute "has-info-container" set to yes.
After closing the attribute "has-info-container" is set to no.

Parameters:
{HTMLElement} listItem - The node which should be closed
{String} itemCourseName  - The course name of the item

 */
function closeInfoContainer(listItem, itemCourseName){
    if (listItem.getAttribute("has-info-container") === "yes") {
        tryRemoveElementByID('info-container-' + itemCourseName);
        listItem.setAttribute("has-info-container", "no");
    }
}

/*

Function: closeStatisticsContainer
Closes the statistics container by checking if the container has attribute "has-info-container" set to yes.
After closing the attribute "has-info-container" is set to no.

Parameters:
{HTMLElement} listItem - The node which should be closed
{String} itemCourseName -  The course name of the item
 */
function closeStatisticsContainer(listItem, itemCourseName){
    if (listItem.getAttribute("has-statistics-container") === "yes") {
        tryRemoveElementByID('statistics-container-' + itemCourseName);
        listItem.setAttribute("has-statistics-container", "no");
    }
}

/*

Function: closeAddAttendeesContainer
Closes the attendees container for adding participants by checking if the container has attribute "has-info-container" set to yes.
After closing the attribute "has-info-container" is set to no.

Parameters:
{HTMLElement} listItem - The node which should be closed
{String} itemCourseName -  The course name of the item

 */
function closeAddAttendeesContainer(listItem, itemCourseName){
    if (listItem.getAttribute("has-attendees-container") === "yes") {
        tryRemoveElementByID('add-attendees-container-' + itemCourseName);
        listItem.setAttribute("has-attendees-container", "no");
    }
}

/*

Function: closeAddDatesContainer
Closes the dates container for adding dates by checking if the container has attribute "has-info-container" set to yes.
After closing the attribute "has-info-container" is set to no.

Parameters:
{HTMLElement} listItem - The node which should be closed
{String} itemCourseName - The course name of the item
 */
function closeAddDatesContainer(listItem, itemCourseName){
    if (listItem.getAttribute("has-dates-container") === "yes") {
        tryRemoveElementByID('add-dates-container-' + itemCourseName);
        listItem.setAttribute("has-dates-container", "no");
    }
}

/*

Function: closeContainers
The function calls other closing functions which are explained above.
Helper for closing more than one container.

Parameters:
{HTMLElement} listItem - The node which should be closed
{String} itemCourseName - The course name of the item
{Array} closeContainerFunctions -  Contains closing functions which are called within
 */
function closeContainers(listItem, itemCourseName, closeContainerFunctions){
    closeContainerFunctions.forEach(func => func(listItem, itemCourseName));
}

/*

Function: renderInfoContainerContent
Renders the info container which should be opened if someone clicks on it.

Parameters:
{String} courseName - The name of the course from which the info container should be opened
 */
function renderInfoContainerContent(courseName){
    let infoContainer = document.getElementById("info-container-" + courseName);
    getCourseDataByCoursName(courseName, function(participants, timestamps){
        let attendeesList = infoContainer.getElementsByClassName("attendees-list-view")[0];
        participants.forEach(name => {
            genericAddListItem(attendeesList, ["attendees-list"], name, null);
        });
        let datesList = infoContainer.getElementsByClassName("dates-list-view")[0];
        timestamps.forEach(timestamp => {
            genericAddListItem(datesList, ["dates-list", "row"], timestampToDate(timestamp), null);
        });

    });
}

/*

Function: handleOnDragStart
Handles the onDrag EventListener. Sets the opacity of the dragged item and data to identify the
element in the Drop EventListener.

Parameters:
{Event} event - The event which is triggered
 */
function handleOnDragStart(event) {
    this.style.opacity = '0.4';
    event.dataTransfer.setData('text', event.target.id);
}

/*

Function: handleOnDrop
Handles the onDrop EventListener. Sets the opacity back to one and checks if the elements can be
added to the drop target or not.

Parameters:
{Event} event - The event which is triggered
 */
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

/*

Function: handleOnDragOver
Handles the onDragOver EventListener. Sets the dropEffect to copy.

Parameters:
{Event} event - The event which is triggered
*/
function handleOnDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

/*

Function: addAttendees
Adding attendees to the list and setting the elements to draggable.
The EventListener for onDragStart is set.

Parameters:
{HTMLElement} list - The list is added to this node
{Array} classNameArray - Containing {String} names of html classes which are added to the list elements
{String} value - The name of the user, who should be added to the course
{String} courseName -  The course name to which the user should be added
{String} id -  A unique  id which identifies the user

*/
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

/*

Function: genericAddListItem
Adding attendees to list without setting them to draggable.

Parameters:
{HTMLElement} list - The list is added to this node
{Array} classNameArray - Containing {String} names of html classes which are added to the list elements
{String} value - The name of the user, who should be added to the course
{String} courseName -  The course name to which the user should be added
{String} id -  A unique  id which identifies the user

*/
function genericAddListItem(list, classNameArray, value, id){
    let listEntry = document.createElement("li");
    classNameArray.forEach(className => {
        listEntry.classList.add(className);
    });
    let p = document.createElement("p");
    p.innerHTML = value;
    if(id){
        listEntry.setAttribute("user-id", id);
    }
    listEntry.appendChild(p);
    list.appendChild(listEntry);
}

/*

Function: handleDragAndDrop
HelperFunction to attach all necessary drag and drop EventListener and id attributes.

Parameters:
{HTMLElement} container - The container in which the drag and drop is happening
{Array} courseName - The name of the course in which the attendees are dragged.

*/
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

/*

Function: renderAttendeesContainer
Renders the container in which the attendees from the chosen course are shown and the box for drag and drop.
The drag and drop handler function is called.

Parameters:
{String} courseName - The name of the course
{HTMLElement} courseItemNode - The course node

*/
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

/*

Function: updateAttendeesCount
Updates the attendees number information if attendees are added to the course.

Parameters:
{String} courseName - The name of the course
{HTMLElement} courseItemNode - The course node

*/
function updateAttendeesCount(courseName, courseItemNode){
    let courseAttendeesField = getChildByClassName(courseItemNode, "course-attendees");
    getCourseByName(courseName, function(course){
        courseAttendeesField.innerHTML = course.participants.length ? course.participants.length : 0;
    });

}


/*

Function: getDateFromDateTimePicker
Fetches the date which are added in the datepicker.

Parameters:
{String} datetimepickerID - the unique id of the datepicker

Returns:
    A firestore timestamp

*/
function getDateFromDateTimePicker(datetimepickerID){
    return new firebase.firestore.Timestamp($("[id='" + datetimepickerID + "']").data('DateTimePicker').getDate().unix(),0);
}

/*

Function: initDatetimepicker
Initializes the datetimepicker.

Parameters:
{String} datetimepickerID - the unique id of the datepicker

*/
function initDatetimepicker(datetimepickerID){

    $("[id='" + datetimepickerID + "']").datetimepicker({
        format: 'DD/MM/YYYY HH:mm',
    });
}


/*

Function: renderDatesContainer
Renders the container for adding dates.
Functions considering the datepicker are called.


Parameters:
{String} courseName - The name of the course
{HTMLElement} courseItemNode - The course node

*/
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


/*

Function: updateNextDate
Updates the date of the course container if a new date is added and is the next which will happen.

Parameters:
{String} courseName - The name of the course
{HTMLElement} courseItemNode - The course node

*/
function updateNextDate(courseName, courseItemNode){
    let courseDateField = getChildByClassName(courseItemNode, "course-date");
    getCourseByName(courseName, function(course){
        let nextDate = course.dates[0];
        courseDateField.innerHTML = nextDate ? timestampToDate(nextDate) : "";
    });
}

/*

Function: createAddDateField
Adds the input field and other necessary html elements and classes for adding dates to a course.

Parameters:
{String} inputID -  The unique id of the input field
*/
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


/*

Function: renderInfoContainer
EventListener function which renders the info container that gets attached after clicking on the course name.

Parameters:
{Event} e - Click event
*/
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



/*

Function: attachInfoContainerEventListeners
Attaches EventListener for adding attendees and adding dates to the info container.

Parameters:
{HTMLElement} infoContainer - The info container element
{String} courseNameOfCurrentItem - The name of the current course item
{HTMLElement} courseItemNode - The node of the course item
*/
function attachInfoContainerEventListeners(infoContainer, courseNameOfCurrentItem, courseItemNode){
    getChildByClassName(infoContainer, "attendees-list").addEventListener("click", function(){
        renderAttendeesContainer(courseNameOfCurrentItem, courseItemNode);
    }, {once: true});

    getChildByClassName(infoContainer, "dates-list").addEventListener("click", function(){
        renderDatesContainer(courseNameOfCurrentItem, courseItemNode);
    }, {once: true});
}



/*

Function: renderStatisticsContainer
EventListener function which renders the statistics container that gets attached after clicking on the statistics button.

Parameters:
{Event} e - Click event
*/
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



/*

Function: initializeCourseContainerFromCourseObject
Initializes the course container corresponding to the course object.

Parameters:
{Object} courseObject - The course object which contains name, num, participants and dates
{HTMLElement} elementToInitialize - The element which should be initialized
*/
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

/*

Function: handleBackButton
Handles if the back button is clicked. The EventListener is removed after clicking the button.

Parameters:
{Event} e - Click Event
*/
function handleBackButton(e){
    e.target.removeEventListener("click", handleBackButton);
    getUserById(auth.currentUser.uid, function(user){
        renderLandingPage(user.isAdmin);
    });
}



/*

Function: renderCourseCreationContainer
Renders the container for creating a new course. Attaches EventListeners to the container.

*/
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

/*

Function: handleCourseCreation
Handles if a new course is created. Calls the renderLandingPage function so that the new course is shown in the view.
Parameters:
{Event} e - Click Event
*/
function handleCourseCreation(e){
    e.preventDefault();
    let courseTitle = document.getElementById("course-title").value;
    createCourse(courseTitle, [], [], function(){
        getUserById(auth.currentUser.uid, function(user){
            renderLandingPage(user.isAdmin);
        });

    });
}

/*

Function: hideAddCourseContainer
Sets the AddCourseContainer to display "none".
*/
function hideAddCourseContainer(){
    document.getElementById("add-course").style.display = "none";
}



/*

Function: renderLandingPage
Renders the landing page and starts the WebWorker.

Parameters:
{Bool} isAdmin - Boolean to check if user is Admin
*/
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

/*

Function: renderUserLandingPage
Renders the landing page for the user

Parameters:
{Array} courseObjects - contains the course objects which should be shown to the user
*/
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

/*

Function: getAllCurrentlyActiveCourseContainers
Gets all courses which were currently active

Parameters:
{Function} callback - contains the course objects which should be shown to the user
*/
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

/*

Function: removeCourseContainerAndAllItsSubContainers
Removes the Course Container and all sub containers of that course.

Parameters:
{String} courseName - Name of the course which should be removed
*/
function removeCourseContainerAndAllItsSubContainers(courseName){
    tryRemoveElementByID("list-item-" + courseName);
    tryRemoveElementByID("statistics-container-" + courseName);
    tryRemoveElementByID("info-container-" + courseName);
}

/*

Function: closeOutdatedContainers
Closes all outdated containers for the user.

Parameters:
{Array} courseObjects - contains the course objects which should be closed
*/
function closeOutdatedContainers(courseObjects){
    getAllCurrentlyActiveCourseContainers(function(activeCourses){
            activeCourses.forEach(activeCourse => {
                if (!courseListContainsCourse(courseObjects, activeCourse)){
                    removeCourseContainerAndAllItsSubContainers(activeCourse.name);
                }
        });
    });
}


/*

Function: handleOnClickBurgerButton
Handles the burger button for the mobile view. Opens and closes menu.

*/
function handleOnClickBurgerButton() {
    let mobileBar = document.getElementById("mobile-bar");
    if (mobileBar.style.display === "block") {
        mobileBar.style.display = "none";
    } else {
        mobileBar.style.display = "block";
    }
}


/*

Function: renderAdminLandingPage
Renders the landing page for the admin.
Function for attaching EventListeners for the admin is called.


Parameters:
{HTMLElement} header - The header element
*/
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

/*

Function: attachCommonEventListenersToLandingPage
Attaches all relevant EventListeners for user and admin.
*/
function attachCommonEventListenersToLandingPage(){
    document.getElementById("logout").addEventListener("click", handleLogout);
    document.getElementById("logoutMobile").addEventListener("click", handleLogout);
    document.getElementById("appName").addEventListener("click", renderLandingPageDistinctly);
    document.getElementById("burger-button").addEventListener("click", handleOnClickBurgerButton);
}

/*

Function: attachAdminEventListenersToLandingPage
Attaches all relevant EventListeners for the admin.
*/
function attachAdminEventListenersToLandingPage(){
    attachCommonEventListenersToLandingPage();
    document.getElementById("register").addEventListener("click", renderRegistrationPage);
    document.getElementById("registerMobile").addEventListener("click", renderRegistrationPage);
    document.getElementById("add-course-p").addEventListener("click", renderCourseCreationContainer);
}

/*

Function: attachUserEventListenersToLandingPage
Attaches all relevant EventListeners for the user.
*/
function attachUserEventListenersToLandingPage(){
    attachCommonEventListenersToLandingPage();
    document.getElementById("profile").addEventListener("click", renderProfilePage);
    document.getElementById("profileMobile").addEventListener("click", renderProfilePage);
}

/*

Function: renderProfilePage
Renders the profile container for the user if he clicks at "Profil" in the header.
*/
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

/*

Function: renderRegistrationPage
Renders the registration container for the admin if he clicks at "Neue Registrierung" in the header.
*/
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

/*

Function: hideCourseList
Hides the course list.
*/
function hideCourseList(){
    hideElementWithoutSpaceUse("course-list");
}
