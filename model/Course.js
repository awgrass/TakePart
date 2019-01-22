var courseRef = firestore.collection("courses");

//class course object TODO maybe name not needed
class Course {
    constructor(_name, _dates, _participants, _statistics) {
        this.name = _name;
        this.dates = _dates;
        this.participants = _participants;
        this.statistics = _statistics;
    }
}

//This function creates a new course in the database
function createCourse(name){
    let newCourseRef = courseRef.doc(name);
    newCourseRef.get()
        .then((docSnapshot) => {
            if (docSnapshot.exists) {
                console.log('Document already exists.')
            } else {
                newCourseRef.set({
                    dates: [],
                    participants: []
                });
                console.log('Document created.')
            }
        });
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
        users: firebase.firestore.FieldValue.arrayUnion(name)
    }).then(function() {
        console.log("Participant added.");
    });;
}

//This function gets all courses of the current user
function getCoursesOfUser(userid) {
    courseRef
        .where("participants", "array-contains", userid)
        .onSnapshot(function(snapshot) {
            snapshot.forEach(item => {
                console.log(item.data().name);
            })
        }, function(error) {
            console.log("Error");
        });
}

//This function gets two arrays ( one with sorted users of this course and second with sorted timestamps)
function getCourseDataByCoursName(courseName) {
    let docRef = courseRef.doc(courseName);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            let users = doc.data().users.sort();
            let timestamps = doc.data().dates.sort();
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}