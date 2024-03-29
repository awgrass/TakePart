const courseRef = firestore.collection("courses");

/*
Class: Course
Course object containing its properties
*/
class Course {
    constructor(name, dates, participants, statistics) {
        this.name = name;
        this.dates = dates;
        this.participants = participants;
        this.statistics = statistics;
    }
}

/*
Function: createCourse
Creates a course into database

Parameters:
{String} name - Course name
{Array} dates - Dates array
{Array} participants - Participants array
{Function} callback - Callback function
*/
function createCourse(name, dates, participants, callback){
    let newCourseRef = courseRef.doc(name);
    newCourseRef.get()
        .then((docSnapshot) => {
            if (docSnapshot.exists) {
                console.log('Document already exists.')
            } else {
                newCourseRef.set({
                    name: name,
                    dates: dates,
                    participants: participants,
                });
                console.log('Document created.')
            }
        });
    callback();
}

/*
Function: addDate
This function adds a course date to a specific course

Parameters:
{Date} date - Date
{String} name - Course name
*/
function addDate(date, name) {
    let course = courseRef.doc(name);
    course.update({
        dates: firebase.firestore.FieldValue.arrayUnion(date)
    }).then(function() {
        console.log("Date added.");
    });
}

/*
Function: getCourseRefBycourseName
This function gets the course reference given its name

Parameters:
{String} courseName - Course name
*/
function getCourseRefBycourseName(courseName){
    return firebase.firestore().doc("courses/" + courseName);
}

/*
Function: addParticipant
This function add a user to a specific course

Parameters:
{Reference} participantsRef - User reference
{String} courseName - Course name
*/
function addParticipant(participantRef, courseName) {
    let course = courseRef.doc(courseName);
    course.update({
        participants: firebase.firestore.FieldValue.arrayUnion(participantRef)
    }).then(function() {
    });
}
/*
Function: getStatisticByCourseName
This function gets all the statistics of a course

Parameters:
{String} courseName - Course name
{Function} callback - Callback function
*/
function getStatisticByCourseName(courseName, callback){
    const statCollection = "courses/" + courseName + "/statistics";
    let statisticsRef = firestore.collection(statCollection);
    let statistics = []
    statisticsRef.get().then(snapshot => {
        snapshot.forEach(stat => {
            statistics.push(stat.data());
        });
        callback(statistics);
    });

}

/*
Function: getAllCourses
This function gets all available courses

Parameters:
{Function} onSuccess - Callback function
*/
function getAllCourses(onSuccess) {
    courseRef.get().then(snapshot => {
        let coursesList = [];
        let numberOfCourses = snapshot.docs.length;
        snapshot.forEach(doc => {
            getStatisticByCourseName(doc.data().name, function(statistic) {
                coursesList.push(new Course(doc.data().name, doc.data().dates, doc.data().participants, statistic));
                if (coursesList.length === numberOfCourses){
                    onSuccess(coursesList);
                }
            });
        });
    });
}

/*
Function: getCourseByName
This function gets the course object given its name

Parameters:
{String} courseName - Course name
{Function} callback - Callback function
*/
function getCourseByName(courseName, callback){
    let docRef = courseRef.doc(courseName);
    docRef.get().then((doc) => {
        if (doc.exists) {
            docRef.collection("statistics").get().then((snap) => {
                let stats = [];
                snap.forEach(function(doc) {
                    stats.push(new Statistics(doc.data().date,
                        doc.data().participated,
                        doc.data().registeredAtThisTime,
                        doc.data().participants));
                });
                callback(new Course(
                    doc.data().name,
                    doc.data().dates.sort(),
                    doc.data().participants,
                    stats.sort(function(a,b){return a.date.seconds - b.date.seconds})
                ));
            });
        }
        else {
            console.log("Course not found.")
        }
    });
}

/*
Function: getCourseDataByCoursName
This function gets two arrays ( one with sorted users of this course and second with sorted timestamps)

Parameters:
{String} courseName - Course name
{Function} callback - Callback function
*/
function getCourseDataByCoursName(courseName, callback) {
    let docRef = courseRef.doc(courseName);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            getObjectListFromRefList(doc.data().participants, function(users){
                let names = [];
                users.forEach(user => {
                   names.push(user.firstName + " " + user.lastName);
                });
                let timestamps = doc.data().dates.sort();
                callback(names.sort(), timestamps);
            });
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

