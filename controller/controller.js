window.onload = function(){
    renderLogin();
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
        };
        document.getElementById('root').innerHTML= this.responseText;
        document.getElementById('submit-button').addEventListener('click', function(){
            let email = document.getElementById('email').value;
            let password = document.getElementById('password').value;
            console.log(email);
            console.log(password);

        });

    };
    xhr.send();
}
