const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const archivo = "tareas.json";

// Leer tareas desde archivo
function leerTareas() {
    const data = fs.readFileSync(archivo);
    return JSON.parse(data);
}

// Guardar tareas en archivo
function guardarTareas(tareas) {
    fs.writeFileSync(archivo, JSON.stringify(tareas, null, 2));
}

// Agregar tarea
app.post("/tareas", (req, res) => {
    const { titulo, dificultad, diasRestantes } = req.body;

    if (!titulo || !dificultad || !diasRestantes) {
        return res.status(400).json({ mensaje: "Faltan datos" });
    }

    if (dificultad < 1 || dificultad > 5 || diasRestantes <= 0) {
        return res.status(400).json({ mensaje: "Datos invalidos" });
    }

    const tareas = leerTareas();

    const nuevaTarea = {
        id: Date.now(),
        titulo,
        dificultad,
        diasRestantes
    };

    tareas.push(nuevaTarea);
    guardarTareas(tareas);

    res.json(nuevaTarea);
});

// Obtener tareas
app.get("/tareas", (req, res) => {
    const tareas = leerTareas();
    res.json(tareas);
});

// Eliminar tarea
app.delete("/tareas/:id", (req, res) => {
    const id = parseInt(req.params.id);

    let tareas = leerTareas();
    tareas = tareas.filter(t => t.id !== id);

    guardarTareas(tareas);

    res.json({ mensaje: "Tarea eliminada" });
});

// Calcular estres
app.get("/estres", (req, res) => {
    const tareas = leerTareas();

    if (tareas.length === 0) {
        return res.json({ indice: 0, nivel: "Sin tareas" });
    }

    let suma = 0;

    tareas.forEach(t => {
        suma += (t.dificultad / t.diasRestantes);
    });

    const indice = suma.toFixed(2);

    let nivel;

    if (indice < 2) {
        nivel = "Bajo";
    } else if (indice < 5) {
        nivel = "Medio";
    } else {
        nivel = "Alto";
    }

    res.json({ indice, nivel });
});

app.listen(PORT, () => {
    console.log("Servidor corriendo en http://localhost:" + PORT);
});
