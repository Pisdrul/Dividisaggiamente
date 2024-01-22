const sceltaUtente = document.querySelector("#users");
const aggUtente = document.querySelector("#aggUtente");
const userSubmit = document.querySelector("#inputUser");
const error =document.querySelector("#error");
const submit = document.querySelector("#submit")
const divuserlist = document.querySelector("#userlist"); 
var ownUser;
var userlist = [];

async function getList(){ //prende lista utenti da mettere nella selectbox
    const response = await fetch("/api/userlist", {
        method: 'GET',
        headers: {'Content-type': 'application/json'} 
    });
    const userlistall = await response.json();
    userlistall.forEach(user => {
        var option = document.createElement('option');
        option.value = user;
        sceltaUtente.appendChild(option);
    });
    const risposta = await fetch("/api/username", {
        method: 'GET',
        headers: {'Content-type': 'application/json'}
    });
    ownUser = await risposta.json();
    userlist.push(await ownUser);
    return userlist;
}

getList();

aggUtente.addEventListener("click", async event=>{
    const answer = await checkUser(inputUser.value)
    if (answer == "trovato"){
        error.innerHTML='';
        if(userlist.length==1){
            addUser(ownUser);
        }
        addUser(inputUser.value);
        userlist.push(inputUser.value);
    }
    else if(answer == "già dentro"){ //evita che un utente venga messo più volte nella lista
        error.innerHTML="Errore, utente già partecipe della spesa";
    }
    else{ //nel caso l'utente non sia valido
        error.innerHTML="Errore, utente non esistente";
    }
})

async function addUser(user){ //crea form con inputfield user non modificabile per inserire ogni quota
    divuserlist.innerHTML+="<div id='"+  user +"formid'style='margin-top: 2%'> <form> <div class='form-group'><label for='user'> Utente: </label> <input type='text' value='"+ user+"' id='user' readonly></div> <div class='form-group'> <label for='quota'> Quota:</label> <input type='number' id='quota'></div></form></div> "
}

async function checkUser(user){ //controlla che gli utenti inseriti nella userlist siano effettivamente 
    const query = "/api/users/search?q=" + user;
    const response = await fetch(query,{
        method: 'GET'
    });
    var check = false;
    const answer = response.json();
    userlist.forEach(usercurr => {
        if(user==usercurr){
            check = true;
        }
    });
    if(answer == "Non ho trovato nessun utente, prova di nuovo"){ 
        return null;
    }
    else if(check){
        return "già dentro";
    }
    else{
        return "trovato";
    };
}

submit.addEventListener("click", async event =>{ //invia i dati al server
    const quotatotale = document.querySelector("#costototale");
    const categoria = document.querySelector("#categoria");
    const descrizione = document.querySelector("#descrizione");
    const data = document.querySelector("#data");
    error.innerHTML='';
    if(quotatotale.value == '' || categoria.value == '' || descrizione.value == '' || data.value == ''){
        error.innerHTML= "Riempi tutti i valori!";
    }
    else if(userlist.length==1){
        const daInviare = {'soldi': quotatotale.value,'categoria': categoria.value, 'descrizione': descrizione.value, 'data': data.value, 'partecipanti': userlist, 'quote': [quotatotale.value]};
        sendData(daInviare);
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
        }
    }
    
});
async function sendData(daInviare){
    const dataPerPost = new Date(daInviare.data);
    const month = dataPerPost.getUTCMonth() + 1;
    const string = "/api/" + dataPerPost.getUTCFullYear() +  "/" + month;
    const response = await fetch(string, {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(daInviare)
    });
    const risposta = await response.json();
    console.log(risposta);
}








    