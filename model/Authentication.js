var auth = firebase.auth();
var userReferece = firebase.database().ref().child('users');// TODO will be moved
/**
 * @param {string} email
 * @param {string} password
 */
function AuthenticateUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then(function() {
            console.log("Signed In");
        })
        .catch(function (error){console.log(error);});
}

/**
 * @param {string} email
 * @param {string} password
 */
function RegisterUser(email, password) {
    auth.createUserWithEmailAndPassword(email, password)
        .then(function() {
            console.log("Registered");
            createUser(email);
        })
        .catch(function (error){console.log(error);});
}

function SignOutUser() {
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
    let userId = userReferece.push().key;
    userReferece(userId).set({
        email: email,
        admin : false
    });
}