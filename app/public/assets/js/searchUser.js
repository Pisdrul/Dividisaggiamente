const text = document.querySelector("#utente");
const table = document.querySelector("#results");
const button = document.querySelector("#submit");
const error = document.querySelector("#error");
var ownUser;
button.addEventListener("click", async event =>{
    getUsername();
    error.innerHTML="";
    table.innerHTML="";
    table.style.display ="none";
    const search = text.value;
    const query = "/api/users/search?q=" + search;
    const result = await sendQuery(query);
    if(result == "Non ho trovato nessun utente, prova di nuovo"){
        error.innerHTML= result;
    } else{
        table.style.display = "block";
        const header = document.createElement("tr");
        header.innerHTML="Risultati:"
        table.appendChild(header);
        for(user in result){
        const tr =document.createElement("tr");
        if(result[user]==ownUser){ //se clicki rimanda al tuo bilancio
            const a = document.createElement("a");
            a.href=`/restricted/speseEBilancio.html`;
            a.innerText= result[user];
            tr.appendChild(a);
        } else{ //se clicki ti manda alla pagine bilancio con utente
            const a = document.createElement("a");
            const link = `/restricted/bilancioUtente.html?id=`+result[user];
            a.href=link;
            a.innerText= result[user];
            tr.appendChild(a);
        }
        if(result[user]===''){
            tr.innerText= "&nbsp";
        }
        table.appendChild(tr);
    }
    }
})

async function sendQuery(query){
    const response = await fetch(query, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    });
    const risposta = await response.json();
    console.log(risposta);
    return risposta;
}

async function getUsername(){ //prendi username dal server
    const risposta = await fetch("/api/username", {
        method: 'GET',
        headers: {'Content-type': 'application/json'}
    });
    ownUser = await risposta.json();
}