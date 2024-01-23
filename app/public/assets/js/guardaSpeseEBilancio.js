var ownUser;
const submitMese = document.querySelector("#cercaMese");
const mese = document.querySelector("#mese");
const submitAnno= document.querySelector("#cercaAnno");
const anno = document.querySelector("#anno");
const spese = document.querySelector("#spese");
const header = document.querySelector("#th");
var bilancio = 0;
var count =0;
//se non funziona fare refresh
submitMese.addEventListener("click", async event=>{
    if(mese.value == ''){
        alert("Inserisci una data");
    }else{
        getSpeseMese(mese.value);
    }
})

submitAnno.addEventListener("click", async event=>{
    if(anno.value == ''){
        alert("Inserisci un anno");
    }else{
        getSpeseAnno(anno.value);
    }
})

async function getUsername(){ //prendi username dal server
    const risposta = await fetch("/api/username", {
        method: 'GET',
        headers: {'Content-type': 'application/json'}
    });
    ownUser = await risposta.json();
}
async function getSpeseMese(query){
    const querysplit = query.split("-");
    const querymese = querysplit[1];
    const queryanno = querysplit[0];
    const request = "/api/budget"+"/"+queryanno+"/"+querymese;
    const response = await fetch(request,{
        method: 'GET',
        headers: {'Content-type': 'application/json'}
    });
    const risposta = await response.json();
    clearTabella();
    risposta.forEach(entry => {
        appendiSpesa(entry);
    });
}

async function getSpeseAnno(query){
    const request = "/api/budget"+"/"+query;
    const response = await fetch(request,{
        method: 'GET',
        headers: {'Content-type': 'application/json'}
    });
    const risposta = await response.json();
    clearTabella();
    risposta.forEach(entry => {
        appendiSpesa(entry);
    });
}

async function getSpese(){ //prendi le spese e mettile nella tabella
    getUsername()
    const response = await fetch("/api/budget", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const risposta = await response.json();
    console.log(risposta);
    risposta.forEach(entry => {
        appendiSpesa(entry);
    });
    const bilanciodiv = document.querySelector("#bilancio"); //inserisce valore di bilancio ogni volta che carica i dati
    bilanciodiv.innerHTML += bilancio + "€";
    if(bilancio >0){ //rosso o verde in base allo stato del bilancio
        bilanciodiv.style.color="green";
    } else if( bilancio<0){
        bilanciodiv.style.color="red";
    }
}
function clearTabella(){
    spese.innerHTML='';
    spese.appendChild(header);
}
function appendiSpesa(entry){
    const tr = document.createElement("tr");
    const id = document.createElement("td");
    const data = document.createElement("td");
    const categoria = document.createElement("td");
    const descrizione = document.createElement("td");
    const quota = document.createElement("td");
    const valquota = filterQuota(entry['Partecipanti+Quote']);
    id.innerText = entry.id;
    data.innerText = entry.Data;
    categoria.innerText = entry.Categoria;
    descrizione.innerText = entry.Descrizione;
    quota.innerText = valquota;
    tr.appendChild(id);
    tr.appendChild(data);
    tr.appendChild(categoria);
    tr.appendChild(descrizione);
    tr.appendChild(quota);
    spese.appendChild(tr);
}
function filterQuota(quotas){
    var filterValue = ownUser+":";
    const statement = quotas.filter(option => option.startsWith(filterValue));
    const quota = statement[0].split(':');
    const valquota = parseFloat(quota[1]);
    if(count == 0){
        addToBilancio(valquota);
    }
    return valquota;

}
function addToBilancio(spesa){
    bilancio-=spesa;
}
getSpese();

