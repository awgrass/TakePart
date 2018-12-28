var courseRef = firestore.collection("courses");

class Course {
    constructor(_id, _name, _dates, _participants, _statistics) {
        this.cid = _id;
        this.name = _name;
        this.dates = _dates;
        this.participants = _participants;
        this.statistics = _statistics;
    }
}

function createCourse(name, dates, participants, statistics)
{
    let newCourseRef = courseRef.doc();
    newCourseRef.set({
        id: newCourseRef.id,
        name: name,
        dates: dates,
        participants: participants,
        statistics: statistics
    });
}

function getCourseById(courseId, onSuccess) {
    let docRef = courseRef.doc(courseId);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            let dbCourse = doc.data();
            var course = new Course(dbCourse.id, dbCourse.name, dbCourse.dates, dbCourse.participants, dbCourse.statistics);
            onSuccess(course);
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}