var userRef = firestore.collection("users");

class User {
    constructor(_uid, _email, _first_name, _last_name, _isAdmin) {
        this.uid = _uid;
        this.email = _email;
        this.first_name = _first_name;
        this.last_name = _last_name;
        this.isAdmin = _isAdmin;
    }
}

function writeUser(user){
    userRef.doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        isAdmin: user.isAdmin
    }).then(console.log("ok"));
}

function getUserById(userId, onSuccess){
    let docRef = userRef.doc(userId);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            //console.log("User data:", doc.data());
            let dbUser = doc.data();
            onSuccess(new User(dbUser.uid, dbUser.email, dbUser.first_name, dbUser.last_name, dbUser.isAdmin));
        } else {
            // doc.data() will be undefined in this case
            console.log("No such user in database!");
        }
    }).catch(function(error) {
        console.log("Error: ", error);
    });
}