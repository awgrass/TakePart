var userRef = firestore.collection("users");

// Class: User
// User Object containing his properties
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

// Function: writeUser
// Adds an user into the database
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

// Function: getUserRefByID
// Gets the user reference given his id
function getUserRefByID(ID){
    return firebase.firestore().doc("users/" + ID);
}

// Function: getUserById
// Gets a user given his id
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

// Function: addCourseToUserByID
// Adds a course to an user
function addCourseToUserByID(userID, courseRef){
    let user = userRef.doc(userID);
    user.update({
        courses: firebase.firestore.FieldValue.arrayUnion(courseRef)
    }).then(function() {
        console.log("course added");
    });
}

// Function: getUsers
// Gets all registered users
function getUsers(callback) {
    userRef.get().then(snapshot => {
        let users = [];
        snapshot.forEach(doc => {
            users.push(new User(doc.data().uID, doc.data().firstName, doc.data().lastName,
                doc.data().email, doc.data().courses, doc.data().isAdmin));
            if (snapshot.docs.length === users.length){
                callback(users);
            }
        });
    }).catch(function(error) {
        console.log("Error: ", error);
    });
}