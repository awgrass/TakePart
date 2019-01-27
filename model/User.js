var userRef = firestore.collection("users");

class User {
    constructor(uID, firstName, lastName, email, courses, isAdmin) {
        this.uID = uID;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.courses = courses;
        this.isAdmin = isAdmin;
    }
}

function writeUser(user){
    userRef.doc(user.uID).set({
        uID: user.uID,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        courses: user.courses,
        isAdmin: user.isAdmin
    }).then(console.log("ok"));
}

function getUserById(userID, onSuccess){
    let docRef = userRef.doc(userID);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            //console.log("User data:", doc.data());
            let dbUser = doc.data();
            onSuccess(new User(dbUser.uID, dbUser.firstName, dbUser.lastName, dbUser.email, dbUser.courses, dbUser.isAdmin));
        } else {
            // doc.data() will be undefined in this case
            console.log("No such user in database!");
        }
    }).catch(function(error) {
        console.log("Error: ", error);
    });
}

function getObjectListFromRefList(refList, callback){
    let objectList = []
    refList.forEach(ref => {
        ref.get().then(function(doc){
            objectList.push(doc.data());
            if (objectList.length === refList.length){
                callback(objectList);
            }
        })
    })
}

function getCoursesOfCurrentUser(userID, callback){
    getUserById(userID, function(user){
        getObjectListFromRefList(user.courses, callback);
    });
}

function getUsers(callback) {
    userRef.get().then(snapshot => {
        var users = [];
        snapshot.forEach(doc => {
            users.push(new User(doc.uID, doc.firstName, doc.lastName, doc.email, doc.courses, doc.isAdmin))
        });
        callback(users)
    }).catch(function(error) {
        console.log("Error: ", error);
    });
}