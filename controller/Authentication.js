var auth = firebase.auth();
var currentUser = null;

/*

Function: authenticateUser
Authenticates the user through the firebase web service

Parameters:
{String} email - Email of user
{String] password - Password of user
{Function} handleSuccessfullAuthentication - Callback function
 */
function authenticateUser(email, password, handleSuccessfullAuthentication) {
    auth.signInWithEmailAndPassword(email, password)
        .then(function(){
            currentUser = auth.currentUser;
            handleSuccessfullAuthentication();
        })
        .catch(function (error){console.log(error);});
}

// Function: handleLogin
// Gets the user login data from the page and calls the authenticateUser function.
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
            getUserById(auth.currentUser.uid, renderLandingPageDistinctly);
        } else {
            console.log("Authentication failed.");
        }
    });
}


// Function: handleLogout
// Function that handles logout process
function handleLogout(){
    setCookie("session", "", -1);
    if (worker !== undefined) stopWorker();
    signOutUser();
    renderLogin();
}

// Function: signOutUser
// Signs out the user from the authentication service
function signOutUser() {
    auth.signOut().catch(function (err) {})
        .then(function() { console.log('Signed Out');},
            function(error) { console.error('Sign Out Error', error);
            });
}


// Function: setCookie
// Sets the user cookie
function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}


// Function: getCookie
// Gets the saved cookie
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}


// Function: handleRegister
// Handles the registration process of an user
function handleRegister(e){
    e.preventDefault();
    let verified = false;
    let firstName = document.getElementById("first-name").value;
    let lastName = document.getElementById("last-name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let password_check = document.getElementById("password-check").value;
    let isAdmin = document.getElementById("is-admin-check").checked;

    if (password !== password_check){
        console.log("passsword do not match");
        document.getElementById("password").classList.add('has-error');
        document.getElementById("password-check").classList.add('has-error');
    }
    console.log("input: " + firstName, lastName, email, password, isAdmin);
    registerUser(firstName, lastName, email, password, isAdmin, handleRegister);
    renderLandingPageDistinctly();

}


/*

Function: registerUSer
Registers the user through the firebase service

Parameters:
{String} firstName - First name of user
{String] lastName - lastName of user
{String} email - Email of user
{String} password - Password of user
{Boolean} isAdmin - If user is admin or not
{Function} callback - Callback function
 */
function registerUser(firstName, lastName, email, password, isAdmin, callback) {
    auth.createUserWithEmailAndPassword(email, password)
        .then(function(userData) {
            console.log("Registered");
            console.log(userData);
            let user = new User(userData.user.uid, firstName, lastName, email, [], isAdmin);
            writeUser(user);
        })
        .catch(function (error){
            console.log(error);
            callback();
        });
}
