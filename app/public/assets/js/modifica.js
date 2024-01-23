const submitButton = document.querySelector("#submit");
const deleteButton = document.querySelector("#delete");
const divuserlist = document.querySelector("#userlist");
const idquery = window.location.search;
const params =new URLSearchParams(idquery);
const id = params.get('id');
const userlist =[];
//Uguale alla pagina nuova spesa ma con modifica al posto di submit e il pulsante per la cancellazione della spesa
getData(id);
var ownUser;

async function getUsername(){ //prendi username dal server
    const risposta = await fetch("/api/username", {
        method: 'GET',
        headers: {'Content-type': 'application/json'}
    });
    ownUser = await risposta.json();
}
getUsername();
submitButton.addEventListener("click", async event=>{
    const quotatotale = document.querySelector("#costototale");
    const categoria = document.querySelector("#categoria");
    const descrizione = document.querySelector("#descrizione");
    const data = document.querySelector("#data");
    error.innerHTML='';
    if(quotatotale.value == '' || categoria.value == '' || descrizione.value == '' || data.value == ''){
        error.innerHTML= "Riempi tutti i valori!";
    }
    else if(userlist.length==0){
        userlist.push(ownUser);
        const daInviare = {'soldi': quotatotale.value,'categoria': categoria.value, 'descrizione': descrizione.value, 'data': data.value, 'partecipanti': userlist, 'quote': [quotatotale.value]};
        sendData(daInviare);
        alert("Spesa modificata!");
        location.href="cercaSpesa.html";
    }
    else{
        const quotas = document.querySelectorAll("#quota");
        let somma = 0;
        let quotavalues = [];
        quotas.forEach(quota => {
            somma += parseInt(quota.value);
            quotavalues.push(parseInt(quota.value));
        });
        if(somma != quotatotale.value){
            error.innerHTML="Le quote non sommano alla quota totale!"
        }
        else{
            const daInviare = {'soldi': quotatotale.value,'categoria': categoria.value, 'descrizione': descrizione.value, 'data': data.value, 'partecipanti': userlist, 'quote': quotavalues};
            sendData(daInviare);
            alert("Spesa modificata!");
            location.href="cercaSpesa.html";
        }
    }
});
async function sendData(daInviare){
    const string = "/api/budget/2024/01/"+id;
    const response = await fetch(string, {
        method: 'PUT',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(daInviare)
    });
    const risposta = await response.json();
}

deleteButton.addEventListener("click", async event =>{ //cancella spesa
    const response = await fetch("/api/budget/2024/1/"+id,{ //id unico, non mi interessano valori di mese e anno
        method: 'DELETE',
    });
    const risposta = await response.json();
    if(risposta == "fatto"){
        alert("Spesa cancellata");
        location.href = "cercaSpesa.html";
    }
})
async function getData(id){
    const request = "/api/budget/2024/01/"+id; //id unico, non mi interessano valori di mese e anno
    const response = await fetch(request,{
        method: 'GET',
        headers: {'Content-type': 'application/json'}
    });
    const spesa = await response.json(); 
    document.querySelector("#categoria").value = spesa.Categoria;
    document.querySelector("#descrizione").value= spesa.Descrizione;
    const totale = await getFullQuota(spesa['Partecipanti+Quote']);
    document.querySelector("#costototale").value= totale;
    document.querySelector("#data").valueAsDate = new Date(spesa.Data);
    if(spesa['Partecipanti+Quote'].length > 1){
        spesa['Partecipanti+Quote'].forEach(entry => {
            const split = entry.split(":");
            addUser(split);
        });
    }
}

async function addUser(entry){ //crea form con inputfield user non modificabile per inserire ogni quota
    userlist.push(entry[0]);
    divuserlist.innerHTML+="<div id='"+  entry[0] +"formid'style='margin-top: 2%'> <form> <div class='form-group'><label for='user'> Utente: </label> <input type='text' value='"+ entry[0]+"' id='user' readonly></div> <div class='form-group'> <label for='quota'> Quota:</label> <input type='number' id='quota' value='"+ entry[1] +"'></div></form></div> "
}

async function getFullQuota(quote){
    var totale = 0;
    quote.forEach(entry => {
        const split = entry.split(':');
        totale+=parseFloat(split[1]);
    });
    return totale;
}
