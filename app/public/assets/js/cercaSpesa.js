var ownUser;
const categoria = document.querySelector("#categoria");
const descrizione = document.querySelector("#descrizione");
const button = document.querySelector("#cerca");
const table = document.querySelector("#searchTable")


async function getUsername(){ //prendi username dal server
    const risposta = await fetch("/api/username", {
        method: 'GET',
        headers: {'Content-type': 'application/json'}
    });
    ownUser = await risposta.json();
}

button.addEventListener("click", async event =>{
    table.innerHTML='';
    getUsername();
    const querycat = "Categoria=" + categoria.value;
    const querydescr = "Descrizione=" + descrizione.value;
    const query = "/api/budget/search?"+ "&" +querycat+ "&" +querydescr;
    const result = await fetch(query,{
        method: 'GET',
        headers: {'Content-type': 'application/json'}
    });
    const risposta = await result.json();
    table.innerHTML="<tr id=th'><th> ID Spesa</th><th> Data</th><th> Categoria</th><th> Descrizione</th><th> Quota</th></tr>"
    for(entry in risposta){
        appendiSpesa(risposta[entry]);
    }
});


function appendiSpesa(entry){
    const tr = document.createElement("tr");
    const data = document.createElement("td");
    const categoria = document.createElement("td");
    const descrizione = document.createElement("td");
    const quota = document.createElement("td");
    const valquota = filterQuota(entry['Partecipanti+Quote']);
    const a = document.createElement("a");
    a.href="/restricted/modifica.html?id="+entry.id;
    a.innerText= entry.id;
    data.innerText = entry.Data;
    categoria.innerText = entry.Categoria;
    descrizione.innerText = entry.Descrizione;
    quota.innerText = valquota;
    tr.appendChild(a);
    tr.appendChild(data);
    tr.appendChild(categoria);
    tr.appendChild(descrizione);
    tr.appendChild(quota);
    table.appendChild(tr);
}
function filterQuota(quotas){
    var filterValue = ownUser+":";
    const statement = quotas.filter(option => option.startsWith(filterValue));
    const quota = statement[0].split(':');
    const valquota = parseFloat(quota[1]);
    return valquota;

}