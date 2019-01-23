var auth = firebase.auth();
var currentUser = null;


/**
 * @param {string} email
 * @param {string} password
 * @param handleSuccessfullAuthentication
 */
function authenticateUser(email, password, handleSuccessfullAuthentication) {
    auth.signInWithEmailAndPassword(email, password)
        .then(function(){
            currentUser = auth.currentUser;
            handleSuccessfullAuthentication();
        })
        .catch(function (error){console.log(error);});
}

function handleLogin(){
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let isChecked = document.getElementById('remember-me').checked;

    authenticateUser(email, password, function(){
        if (auth.currentUser){
            if(isChecked){
                //TODO: we need a better way to set the currentUser global variable...
                let cookieVal = email + "|" + password;
                let days = 7;
                setCookie("session", cookieVal, days);
            }
            getUserById(auth.currentUser.uid, renderLandingPage);
        } else {
            console.log("Authentication failed.");
        }
    });
}

/**
 * @param {string} email
 * @param {string} password
 * @param first_name
 * @param last_name
 * @param isAdmin
 */
function registerUser(email, password, first_name, last_name, isAdmin) {
    auth.createUserWithEmailAndPassword(email, password)
        .then(function(userData) {
            console.log("Registered");
            let user = new User(userData.user.uid, email, first_name, last_name, isAdmin);
            writeUser(user);
        })
        .catch(function (error){console.log(error);});
}

function signOutUser() {
    auth.signOut().catch(function (err) {})
        .then(function() { console.log('Signed Out');},
            function(error) { console.error('Sign Out Error', error);
    });
}
