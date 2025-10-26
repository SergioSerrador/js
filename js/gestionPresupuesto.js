// TODO: Variables globales
let presupuesto = 0;
let gastos = [];
let idGasto = 0;

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

this.obtenerPeriodoAgrupacion = function(periodo) {
    const d = new Date(this.fecha);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');

    if (periodo === "dia") return `${yyyy}-${mm}-${dd}`;
    if (periodo === "mes") return `${yyyy}-${mm}`;
    if (periodo === "anyo") return `${yyyy}`;
    return "";
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

function filtrarGastos(opts = {}) {
    const {
        fechaDesde,
        fechaHasta,
        valorMinimo,
        valorMaximo,
        descripcionContiene,
        etiquetasTiene
    } = opts || {};

    const desdeTs = (typeof fechaDesde === "string") ? Date.parse(fechaDesde) : NaN;
    const hastaTs = (typeof fechaHasta === "string") ? Date.parse(fechaHasta) : NaN;

    return gastos.filter(g => {
        if (!g) return false;

        if (!isNaN(desdeTs) && typeof g.fecha === "number") {
            if (g.fecha < desdeTs) return false;
        }

        if (!isNaN(hastaTs) && typeof g.fecha === "number") {
            if (g.fecha > hastaTs) return false;
        }

        if (typeof valorMinimo === "number") {
            if (typeof g.valor !== "number" || g.valor < valorMinimo) return false;
        }

        if (typeof valorMaximo === "number") {
            if (typeof g.valor !== "number" || g.valor > valorMaximo) return false;
        }

        if (typeof descripcionContiene === "string" && descripcionContiene.length) {
            const desc = (g.descripcion || "").toString().toLowerCase();
            if (desc.indexOf(descripcionContiene.toLowerCase()) === -1) return false;
        }

        if (Array.isArray(etiquetasTiene) && etiquetasTiene.length) {
            const buscadas = etiquetasTiene
                .filter(t => typeof t === "string")
                .map(t => t.toLowerCase());
            const etiquetasGasto = Array.isArray(g.etiquetas) ? g.etiquetas.map(t => (t || "").toString().toLowerCase()) : [];
            const anyMatch = buscadas.some(b => etiquetasGasto.includes(b));
            if (!anyMatch) return false;
        }

        return true;
    });
}

function agruparGastos(periodo = "mes", etiquetas = [], fechaDesde, fechaHasta) {
    if (typeof periodo !== "string" || !["dia", "mes", "anyo"].includes(periodo)) {
        periodo = "mes";
    }

    const desdeTs = (typeof fechaDesde === "string" && !isNaN(Date.parse(fechaDesde))) ? Date.parse(fechaDesde) : null;
    const hastaTs = (typeof fechaHasta === "string" && !isNaN(Date.parse(fechaHasta))) ? Date.parse(fechaHasta) : Date.now();

    const buscadas = Array.isArray(etiquetas) && etiquetas.length
        ? etiquetas.filter(t => typeof t === "string").map(t => t.toLowerCase())
        : null;

    const seleccion = gastos.filter(g => {
        if (!g) return false;

        if (typeof g.fecha === "number") {
            if (desdeTs !== null && g.fecha < desdeTs) return false;
            if (typeof hastaTs === "number" && g.fecha > hastaTs) return false;
        }

        if (Array.isArray(buscadas) && buscadas.length) {
            const etiquetasGasto = Array.isArray(g.etiquetas)
                ? g.etiquetas.map(t => (t || "").toString().toLowerCase())
                : [];
            const anyMatch = buscadas.some(b => etiquetasGasto.includes(b));
            if (!anyMatch) return false;
        }

        return true;
    });

    const resultado = {};
    seleccion.forEach(g => {
        const key = (typeof g.obtenerPeriodoAgrupacion === "function") ? g.obtenerPeriodoAgrupacion(periodo) : "";
        if (!key) return;
        if (!Object.prototype.hasOwnProperty.call(resultado, key)) resultado[key] = 0;
        const v = (typeof g.valor === "number") ? g.valor : 0;
        resultado[key] += v;
    });

    return resultado;
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
    calcularBalance,
    filtrarGastos,
    agruparGastos
}

const ejemplo1 = new CrearGasto("Comida", 25.5, "2025-10-01", "alimentacion", "restaurante");
const ejemplo2 = new CrearGasto("Transporte", 2.75);
const ejemplo3 = new CrearGasto("Ropa", 50, "fecha-no-valida", "ropa", "tienda");