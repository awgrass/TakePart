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
function createCourse(name, dates, participants, statistics){
    let newCourseRef = courseRef.doc(name);
    newCourseRef.get()
        .then((docSnapshot) => {
            if (docSnapshot.exists) {
                console.log('Document already exists.')
            } else {
                newCourseRef.set({
                    dates: dates,
                    participants: participants,
                    statistics: statistics
                });
                console.log('Document created.')
            }
        });
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

//TODO function not needed yet
function getCourseById(courseName, onSuccess) {
    let docRef = courseRef.doc(courseName);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            let dbCourse = doc.data();
            let course = new Course(dbCourse.id, dbCourse.name, dbCourse.dates, dbCourse.participants, dbCourse.statistics);
            onSuccess(course);
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}