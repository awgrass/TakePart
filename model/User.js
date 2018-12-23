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

function writeUser(userId)
{
    userRef.doc(userId).set({
        uid: 123,
        email: "",
        first_name: "",
        last_name: "",
        isAdmin: false
    });
}

function readUserById(userId, onSuccess) {
    let docRef = userRef.doc(userId);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            let dbUser = doc.data();
            currentUser = new User(dbUser.uid, dbUser.email, dbUser.first_name, dbUser.last_name, dbUser.isAdmin);
            onSuccess();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}