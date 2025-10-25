// TODO: Variables globales
let presupuesto = 0;
let gastos = [];
let idGasto = 0;
// TODO: Funciones adicionales
 
 
function actualizarPresupuesto(valor) {
 
  if (typeof valor === "number" && valor >= 0) {
    presupuesto = valor;
    return presupuesto;
  } else {
   
    console.log("Error: el valor debe ser un numero no negativo.");
    return -1;
  }
}
 
function mostrarPresupuesto() {
    // TODO
    return "Tu presupuesto actual es de " + presupuesto + " €";
 
}
 
function CrearGasto(descripcion, valor, fechaStr, ...etiquetas) {
    if (typeof valor !== "number" || valor < 0) {
        valor = 0;
    }

    this.descripcion = descripcion;
    this.valor = valor;

    let timestamp;
    if (typeof fechaStr === "string") {
        const parsed = Date.parse(fechaStr);
        timestamp = !isNaN(parsed) ? parsed : Date.now();
    } else {
        timestamp = Date.now();
    }
    this.fecha = timestamp;

    this.etiquetas = [];

    this.anyadirEtiquetas = function(...tags) {
        tags.forEach(tag => {
            if (typeof tag === "string" && tag.length) {
                const clean = tag.replace(/^[\s-]+/, '').trim();
                if (clean.length && !this.etiquetas.includes(clean)) {
                    this.etiquetas.push(clean);
                }
            }
        });
    };

    this.borrarEtiquetas = function(...tags) {
        if (!tags || tags.length === 0) return;
        const cleans = tags
            .filter(t => typeof t === 'string')
            .map(t => t.replace(/^[\s-]+/, '').trim())
            .filter(Boolean);
        if (cleans.length === 0) return;
        this.etiquetas = this.etiquetas.filter(e => !cleans.includes(e));
    };

    this.actualizarFecha = function(nuevaFechaStr) {
        if (typeof nuevaFechaStr !== "string") return;
        const parsed = Date.parse(nuevaFechaStr);
        if (!isNaN(parsed)) {
            this.fecha = parsed;
        }
    };

    if (etiquetas && etiquetas.length) {
        this.anyadirEtiquetas(...etiquetas);
    }

    this.mostrarGasto = function() {
      return "Gasto correspondiente a " + this.descripcion +
             " con valor " + this.valor + " €" +
             " (fecha: " + new Date(this.fecha).toLocaleString() + ")" +
             " etiquetas: [" + this.etiquetas.join(", ") + "]";
    };

    // nueva función solicitada: texto multilinea con detalle completo
    this.mostrarGastoCompleto = function () {
    let texto = `Gasto correspondiente a ${this.descripcion} con valor ${this.valor} €.\n`;
    texto += `Fecha: ${new Date(this.fecha).toLocaleString()}\n`;
    texto += `Etiquetas:\n`;

    this.etiquetas.forEach(tag => {
        const clean = (typeof tag === 'string')
            ? tag.replace(/^[\s-]+/, '').trim()
            : String(tag);
        texto += `- ${clean}\n`;
    });

    return texto;
};


    this.actualizarDescripcion = function(nuevaDescripcion){
      this.descripcion = nuevaDescripcion;
    };

    this.actualizarValor = function(nuevoValor){
      if (typeof nuevoValor === "number" && nuevoValor >= 0){
        this.valor = nuevoValor;
      } else {
        console.log("Error: el valor debe ser un numero negativo.")
      }
    };

}

function listarGastos() {
    return gastos;
}

function anyadirGasto(gasto) {
    if (typeof gasto !== "object" || gasto === null) {
        return null;
    }
    gasto.id = idGasto;
    idGasto++;
    gastos.push(gasto);
    return gasto;
}

function borrarGasto(id) {
    const idx = gastos.findIndex(g => g && g.id === id);
    if (idx !== -1) {
        gastos.splice(idx, 1);
    }
}

function calcularTotalGastos() {
    return gastos.reduce((sum, g) => {
        const v = (g && typeof g.valor === "number") ? g.valor : 0;
        return sum + v;
    }, 0);
}

function calcularBalance() {
    return presupuesto - calcularTotalGastos();
}
// Exportación de funciones
export {
    mostrarPresupuesto,
    actualizarPresupuesto,
    CrearGasto,
    listarGastos,
    anyadirGasto,
    borrarGasto,
    calcularTotalGastos,
    calcularBalance
}

const ejemplo1 = new CrearGasto("Comida", 25.5, "2025-10-01", "alimentacion", "restaurante");
const ejemplo2 = new CrearGasto("Transporte", 2.75);
const ejemplo3 = new CrearGasto("Ropa", 50, "fecha-no-valida", "ropa", "tienda");