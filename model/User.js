var userReference = firebase.database().ref().child('users');
class User {
    constructor(_email, _first_name, _last_name, _isAdmin) {
        this.email = _email;
        this.first_name = _first_name;
        this.last_name = _last_name;
        this.isAdmin = _isAdmin;
    }
}

function saveUser(user){
    let userId = userReference.push().key;
    userReference(userId).set({user});
}

function getUser(userId) {

    return firebase.database().ref('/users/' + userId).once('value')
        .then(function() {
            console.log("User exists.");
        }).catch(function () {
            console.log("User does not exists.")
        });
}
