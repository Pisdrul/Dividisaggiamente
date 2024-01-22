const text = document.querySelector("#utente");
const table = document.querySelector("#results");
const button = document.querySelector("#submit");
const error = document.querySelector("#error");
button.addEventListener("click", async event =>{
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
        tr.innerHTML = result[user];
        if(result[user]===''){
            tr.innerHTML= "&nbsp";
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