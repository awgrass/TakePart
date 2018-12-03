var auth = firebase.auth();
var userReference = firebase.database().ref().child('users');// TODO will be moved

/**
 * @param {string} email
 * @param {string} password
 * @param handleSuccessfullLogin
 */
function authenticateUser(email, password, handleSuccessfullLogin) {
    auth.signInWithEmailAndPassword(email, password)
        .then(function() {
                handleSuccessfullLogin();
        })
        .catch(function (error){console.log(error);});
}

/**
 * @param {string} email
 * @param {string} password
 */
function registerUser(email, password) {
    auth.createUserWithEmailAndPassword(email, password)
        .then(function() {
            console.log("Registered");
            createUser(email);
        })
        .catch(function (error){console.log(error);});
}

function signOutUser() {
    auth.signOut().catch(function (err) {})
        .then(function() { console.log('Signed Out');},
            function(error) { console.error('Sign Out Error', error);
    });
}

function getCurrentUser() {
    return auth.currentUser;
}
/*TODO this function will be moved in proper file*/
function createUser(email) {
    let userId = userReference.push().key;
    userReference(userId).set({
        email: email,
        admin : false
    });
}
