const btnContainer = document.getElementById("top-button-container");
const btnIniciar = document.getElementById("btnIniciar");
const quizForm = document.getElementById("quizForm");
const listaPreguntas = document.getElementById("listaPreguntas");
const resultado = document.getElementById("resultado");

let btnPDF;

let preguntas = [];

document.addEventListener('DOMContentLoaded', async () => {
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

        if (!res.ok) {
            location.href = "index.html";
        } 
    } catch (err) {
        console.error("Error al conectar con el servidor:", err);
        swal("Error", "Error de conexión con el servidor, reenviando a inicio.", "error", {
            buttons: false,
            timer: 3500,
            closeOnClickOutside: false,
            closeOnEsc: false,
        });
        setTimeout(function(){location.href = "index.html"},3000)
    }

    // Revisar Examen Aprovado
    try {
        const res = await fetch("http://localhost:3000/api/showpdf", {
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
            btnPDF = document.createElement("button");
            btnPDF.textContent = "OBTENER CERTIFICADO";
            btnPDF.className = "exam-button";
            btnPDF.addEventListener("click", async () => {
                // Generar PDF
                try {
                const res = await fetch("http://localhost:3000/api/pdf", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`,
                        "Content-Type": "application/json"
                    }
                });

                if (res.ok) {
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    window.addEventListener("unload", () => {
                        URL.revokeObjectURL(url);
                        console.log("url liberada");
                    });
                    swal("PDF realizado con éxito","Ahora puede descargar el certificado","success");
                } else {
                    //const data = await res.json();
                    const messageError = data?.error ?? `${res.status}: ${res.statusText}`;

                    swal("Error", messageError, "error");
                }
            } catch (err) {
                console.error("Error al conectar con el servidor:", err);
                swal("Error", "Error de conexión con el servidor.", "error");
            }
            });
            btnContainer.appendChild(btnPDF);
        } 
    } catch (err) {
        console.error("Error al conectar con el servidor:", err);
        swal("Error", "Error de conexión con el servidor, reenviando a inicio.", "error", {buttons: false,timer: 3000,});
    }
});

btnIniciar.addEventListener("click", async () => {
    try{
        const res = await fetch("http://localhost:3000/api/start", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });

        let data
        try {
            data = await res.json();
        } catch (parseErr) {
            console.warn("Respuesta no JSON del servidor", parseErr);
            data = {};
        }
        if (res.ok) {
            let questionID = 0;
            preguntas = data.questions;

            listaPreguntas.innerHTML = "";
            preguntas.forEach(q => {
                questionID++;

                const div = document.createElement("div");
                div.className = "card";
                div.innerHTML = `
                    <p><strong>${questionID}.</strong> ${q.text}</p>
                    ${q.options.map(opt => `
                        <label>
                            <input type="radio" name="q_${q.id}" value="${opt}"> ${opt}
                        </label><br>
                    `).join("")}
                `;
                listaPreguntas.appendChild(div);
            });
            quizForm.style.display = "block";
            resultado.innerHTML = "";
        } else {
            let messageError = data?.error ?? `${res.status}: ${res.statusText}`;

            swal("Error", messageError, "error");
        }
    } catch (err) {
        console.error("Error al conectar con el servidor:", err);
        swal("Error", "Error de conexión con el servidor.", "error");
    }
});

quizForm.addEventListener("submit", async e => {
    e.preventDefault();
    const answers = preguntas.map(q => {
        const selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
        return { id: q.id, answer: selected ? selected.value : "" };
    });

    const res = await fetch(`http://localhost:3000/api/submit`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers })
    });
    const data = await res.json();

    console.log(data);

    resultado.innerHTML = `
        <hr class="divide-main">
        <h2>Resultado: ${data.score}/${data.total}</h2>
        <h2>Si aprobo, recargue la pagina para obtener su certificado</h2>
        ${data.details.map(d => `
            <div class="card">
                <p>${d.text}</p>
                <p>Tu respuesta: ${d.yourAnswer ?? "(sin responder)"}</p>
                <p>Correcta: ${d.correctAnswer}</p>
                <p class="${d.correct ? "ok" : "bad"}">
                    ${d.correct ? " Correcto" : " Incorrecto"}
                </p>
            </div>
        `).join("")}
    `;
});
