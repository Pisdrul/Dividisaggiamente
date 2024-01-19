const logout = document.querySelector("#logout");

logout.addEventListener("click", async event=> {
    console.log("Premuto pulsante");
    const response = await fetch("/api/auth/logout", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        });
    alert("Hai fatto logout");
    window.location.href = "/index.html";
})