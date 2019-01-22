window.onload = function(){
    let cookie = getCookie("session");
    if (cookie !== null){
        //TODO: check if uid stored in cookie is in database
        let splittedCookie = cookie.split("|");
        let email = splittedCookie[0];
        let password = splittedCookie[1];
        authenticateUser(email, password, function(){
            if (auth.currentUser){
                renderLandingPage();
            }
        });
    }
    else{
        renderLogin();
    }

};

function renderLogin(){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'login.html', true);
    xhr.onreadystatechange= function() {
        if (this.readyState !== 4){
            return;
        }
        if (this.status !== 200){
            return
        }
        document.getElementById('root').innerHTML= this.responseText;
        document.getElementById('submit-button').addEventListener('click', handleLogin);

    };
    xhr.send();
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

function renderLandingPage(user){
    currentUser = user;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'landing-page.html', true);
    xhr.onreadystatechange= function() {
        if (this.readyState !== 4){
            return;
        }
        if (this.status !== 200){
            return
        }
        document.getElementById('root').innerHTML= this.responseText;
        //document.getElementById('submit-button').addEventListener('click', handleLogin);

    };
    xhr.send();
}