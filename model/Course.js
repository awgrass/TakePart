const courseRef = firestore.collection("courses");
var courses = [];

//class course object TODO maybe name not needed
class Course {
    constructor(name, dates, participants, statistics) {
        this.name = name;
        this.dates = dates;
        this.participants = participants;
        this.statistics = statistics;
    }
}

//This function creates a new course in the database
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

//This function adds a course date to a specific course
function addDate(date, name) {
    let course = courseRef.doc(name);
    course.update({
        dates: firebase.firestore.FieldValue.arrayUnion(date)
    }).then(function() {
        console.log("Date added.");
    });
}

//This function add a user to a specific course
function addParticipant(name, coursename) {
    let course = courseRef.doc(name);
    course.update({
        participants: firebase.firestore.FieldValue.arrayUnion(name)
    }).then(function() {
        console.log("Participant added.");
    });
}

//This function gets all courses of the current user
function getCoursesOfUser(userid) {
    courseRef.where("participants", "array-contains", userid)
        .get().then(snapshot => {
        let coursesList = [];
        let numberOfCourses = snapshot.docs.length;
        snapshot.forEach(doc => {
            getStatisticByCourseName(doc.data().name, function(statistic) {
                coursesList.push(new Course(doc.data().name, doc.data().dates, doc.data().participants, statistic));
                if (coursesList.length === numberOfCourses){
                    courses = coursesList;
                }
            });
        });
    });
}

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

function getCourseByName(courseName, callback){
    let docRef = courseRef.doc(courseName);
    docRef.get().then((doc) => {
        if (doc.exists) {
            docRef.collection("statistics").get().then((snap) => {
                let stats = [];
                snap.forEach(function(doc) {
                    console.log(doc.id, " => ", doc.data());
                    stats.push(new Statistics(doc.data().date, doc.data().participated, doc.data().registeredAtThisTime));
                    console.log(stats);
                });
                callback(new Course(
                    doc.data().name,
                    doc.data().dates,
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

//This function gets two arrays ( one with sorted users of this course and second with sorted timestamps)
function getCourseDataByCoursName(courseName, callback) {
    let docRef = courseRef.doc(courseName);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            let participants = doc.data().participants.sort();
            let timestamps = doc.data().dates.sort();
            callback(participants, timestamps);
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

function addStatisticListenter() {
    courseRef.where("participants", "array-contains", userid)
        .get()
        .then(function(snap){
            snap.forEach(function(doc) {
                courseRef.doc(doc.id).collection("statistics")
                    .onSnapshot(function(snapshot) {
                        snapshot.docChanges().forEach(function(change) {
                            if (change.type === "added") {
                                console.log("New city: ", change.doc.data());
                            }
                            if (change.type === "modified") {
                                console.log("Modified city: ", change.doc.data());
                            }
                            if (change.type === "removed") {
                                console.log("Removed city: ", change.doc.data());
                            }
                        });
                    });
            });
        });
}
