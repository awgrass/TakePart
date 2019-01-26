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
            getUserById(auth.currentUser.uid, renderLandingPage);
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

function handleRegister(isAdmin){
    //get firstname, lastname, email, password
    //registerUser(firstName, lastName, email, password, false);
}

function registerUser(firstName, lastName, email, password, isAdmin) {
    auth.createUserWithEmailAndPassword(email, password)
        .then(function(userData) {
            console.log("Registered");
            console.log(userData);
            let user = new User(userData.user.uid, firstName, lastName, email, isAdmin);
            writeUser(user);
        })
        .catch(function (error){console.log(error);});
}


