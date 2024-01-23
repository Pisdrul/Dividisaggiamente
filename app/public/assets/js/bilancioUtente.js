const idquery = window.location.search;
const params =new URLSearchParams(idquery);
const id = params.get('id');
const bilancioCon = document.querySelector("#bilancioCon");
bilancioCon.innerHTML+= id;
const table = document.querySelector("#guardaSpese");
var ownUser;
getUsername();
getData(id);
async function getUsername(){ //prendi username dal server
    const risposta = await fetch("/api/username", {
        method: 'GET',
        headers: {'Content-type': 'application/json'}
    });
    ownUser = await risposta.json();
}

async function getData(id){
    const query = "/api/balance/"+id;
    const response = await fetch(query,{
        method: 'GET',
        headers: {'Content-type': 'application/json'}
    });
    const risposta = await response.json();
    risposta.forEach(entry => {
        appendiSpesa(entry);
    });
}

function appendiSpesa(entry){
    const tr = document.createElement("tr");
    const data = document.createElement("td");
    const categoria = document.createElement("td");
    const descrizione = document.createElement("td");
    const quota1 = document.createElement("td"); //quota utente loggato
    const quota2 = document.createElement("td"); //quota utente con cui si sta facendo il bilancio
    const valquota1 = filterQuota(entry['Partecipanti+Quote'],ownUser);
    const valquota2 = filterQuota(entry['Partecipanti+Quote'],id);
    const a = document.createElement("a");
    a.href="/restricted/modifica.html?id="+entry.id;
    a.innerText= entry.id;
    data.innerText = entry.Data;
    categoria.innerText = entry.Categoria;
    descrizione.innerText = entry.Descrizione;
    quota1.innerText = valquota1;
    quota2.innerText = valquota2;
    tr.appendChild(a);
    tr.appendChild(data);
    tr.appendChild(categoria);
    tr.appendChild(descrizione);
    tr.appendChild(quota1);
    tr.appendChild(quota2);
    table.appendChild(tr);
}
function filterQuota(quotas,id){
    var filterValue = id+":";
    const statement = quotas.filter(option => option.startsWith(filterValue));
    const quota = statement[0].split(':');
    const valquota = parseFloat(quota[1]);
    return valquota;

}