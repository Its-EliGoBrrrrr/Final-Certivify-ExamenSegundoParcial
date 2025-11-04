// Bloqueando botones
document.getElementById("pay-python").disabled = true;
document.getElementById("exam-python").disabled = true;
document.getElementById("pay-cplusplus").disabled = true;
document.getElementById("exam-cplusplus").disabled = true;
document.getElementById("pay-csharp").disabled = true;
document.getElementById("exam-csharp").disabled = true;

const payJava = document.getElementById("pay-java");
const examJava = document.getElementById("exam-java");

payJava.addEventListener("click", async (e) => {
    try {
        const res = await fetch("http://localhost:3000/api/pagar", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pago: true
            })
        });

        let data;
        try {
            data = await res.json();
        } catch (parseErr) {
            console.warn("Respuesta no JSON del servidor", parseErr);
            data = {};
        }

        if (res.ok) {
            swal("Pago realizado con éxito","Ahora puede proseguir con el exámen","success");
        } else {
            let messageError = data?.error ?? `${res.status}: ${res.statusText}`;

            swal("Error", messageError, "error");
        }
    } catch (err) {
        console.error("Error al conectar con el servidor:", err);
        swal("Error", "Error de conexión con el servidor.", "error");
    }
});

examJava.addEventListener("click", async (e) => {
    // Revisar Pago hecho
    try {
        const res = await fetch("http://localhost:3000/api/goquiz", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
            }
        });

        let data;
        try {
            data = await res.json();
        } catch (parseErr) {
            console.warn("Respuesta no JSON del servidor", parseErr);
            data = {};
        }

        if (res.ok) {
            location.href = "./exam-java.html";
        } else {
            let messageError = data?.error ?? `${res.status}: ${res.statusText}`;

            swal("Error", messageError, "error");
        }
    } catch (err) {
        console.error("Error al conectar con el servidor:", err);
        swal("Error", "Error de conexión con el servidor.", "error");
    }
});