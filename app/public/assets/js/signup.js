const pulsante = document.querySelector("#signup");

pulsante.addEventListener("click", async event =>{
    event.preventDefault();
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const user = {username, password}; 
    sendCredentials(user);

async function sendCredentials(user){
    const response = await fetch("/api/auth/signup", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
        });
    if(await response.json() == null){
        alert("Account creato con successo!");
        window.location.href = "/index.html";
    }
    else{
        alert("Utente già esistente, prova con un altro nome");
    }
}
})