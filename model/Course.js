var userRef = firestore.collection("courses");

class Course {
    constructor(_name, _dates, _participants, _statistics) {
        this.name = _name;
        this.dates = _dates;
        this.participants = _participants;
        this.statistics = _statistics;
    }
}

function setCourse(courseId)
{
    userRef.doc(courseId).set({
        name: 123,
        dates: "",
        participants: "",
        statistics: ""
    });
}

function readCourseById(courseId, onSuccess) {
    let docRef = userRef.doc(courseId);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            let dbCourse = doc.data();
            var course = new Course(dbCourse.name, dbCourse.dates, dbCourse.participants, dbCourse.statistics);
            onSuccess();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}