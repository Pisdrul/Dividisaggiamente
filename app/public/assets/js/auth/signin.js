const pulsante = document.querySelector("#auth");

pulsante.addEventListener("click", async event =>{
    event.preventDefault();
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const user = {username, password}; 
    login(user);

async function login(user){
    const response = await fetch("/api/auth/signin", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
        });
    const risposta = await response.json();
    if( risposta== "si"){ //check per vedere se l'utente esiste e le credenziali sono giuste o sbagliate, oppure se l'utente non esiste nel database
        alert("Login andato a buon fine!");
        window.location.href = "/restricted/utente.html";
    }
    else if(risposta == "autenticato"){
        alert("Sei già autenticato!");
        window.location.href = "/restricted/utente.html";
    }
    else if(risposta == "Non esistente") {
        alert("Nome utente non esistente");
    }
    else{
        alert("Credenziali sbagliate");
    }
}
})