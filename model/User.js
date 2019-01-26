var userRef = firestore.collection("users");

class User {
    constructor(uID, firstName, lastName, email, isAdmin) {
        this.uID = uID;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.isAdmin = isAdmin;
    }
}

function writeUser(user){
    userRef.doc(user.uID).set({
        uID: user.uID,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
    }).then(console.log("ok"));
}

function getUserById(userID, onSuccess){
    let docRef = userRef.doc(userID);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            //console.log("User data:", doc.data());
            let dbUser = doc.data();
            onSuccess(new User(dbUser.uID, dbUser.firstName, dbUser.lastName, dbUser.email, dbUser.isAdmin));
        } else {
            // doc.data() will be undefined in this case
            console.log("No such user in database!");
        }
    }).catch(function(error) {
        console.log("Error: ", error);
    });
}