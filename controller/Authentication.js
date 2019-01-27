var auth = firebase.auth();
var currentUser = null;


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
            getUserById(auth.currentUser.uid, renderLandingPageDistinctly);
        } else {
            console.log("Authentication failed.");
        }
    });
}

function handleLogout(){
    setCookie("session", "", -1);
    signOutUser();
    renderLogin();
}

function signOutUser() {
    auth.signOut().catch(function (err) {})
        .then(function() { console.log('Signed Out');},
            function(error) { console.error('Sign Out Error', error);
            });
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

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

function passwordInvalid(){
    //TODO: implement
}

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


