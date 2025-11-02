// variables que guardan el estado de la aplicación
let presupuesto = 0;
let gastos = [];
let idGasto = 0; // contador para asignar un id único a cada gasto

// función para cambiar el valor del presupuesto
function actualizarPresupuesto(valor) {
  // se comprueba que sea un número y que no sea negativo
  if (typeof valor === "number" && valor >= 0) {
    presupuesto = valor; // se guarda el nuevo valor
    return presupuesto;
  } else {
    console.log("error: el valor debe ser un numero no negativo.");
    return -1;
  }
}

// función para devolver el presupuesto actual en forma de texto
function mostrarPresupuesto() {
    return "tu presupuesto actual es de " + presupuesto + " €";
}

// esta es la clase o "función constructora" para crear un nuevo objeto gasto
function CrearGasto(descripcion, valor, fechaStr, ...etiquetas) {
    // si el valor no es un número o es negativo, se pone a 0
    if (typeof valor !== "number" || valor < 0) {
        valor = 0;
    }

    this.descripcion = descripcion;
    this.valor = valor;

    // manejar la fecha
    let timestamp;
    if (typeof fechaStr === "string") {
        // intentar convertir la cadena de texto a un número de milisegundos (timestamp)
        const parsed = Date.parse(fechaStr);
        // si la conversión falla (no es un número), se usa la fecha actual
        timestamp = !isNaN(parsed) ? parsed : Date.now();
    } else {
        timestamp = Date.now(); // si no se da una fecha, se usa la fecha actual
    }
    this.fecha = timestamp;

    this.etiquetas = []; // inicializar las etiquetas como una lista vacía

    // método interno para añadir etiquetas a este gasto
    this.anyadirEtiquetas = function(...tags) {
        tags.forEach(tag => {
            // comprobar que sea una cadena de texto y que tenga algo
            if (typeof tag === "string" && tag.length) {
                // limpiar la etiqueta (quitar espacios al principio y al final)
                const clean = tag.replace(/^[\s-]+/, '').trim();
                // si es válida y no existe ya, la añadimos a la lista
                if (clean.length && !this.etiquetas.includes(clean)) {
                    this.etiquetas.push(clean);
                }
            }
        });
    };

    // método interno para borrar etiquetas de este gasto
    this.borrarEtiquetas = function(...tags) {
        if (!tags || tags.length === 0) return;
        
        // limpiar las etiquetas que queremos borrar, igual que al añadirlas
        const cleans = tags
            .filter(t => typeof t === 'string')
            .map(t => t.replace(/^[\s-]+/, '').trim())
            .filter(Boolean);
        
        if (cleans.length === 0) return;
        // filtrar la lista actual de etiquetas, dejando solo las que no estén en la lista de borrado
        this.etiquetas = this.etiquetas.filter(e => !cleans.includes(e));
    };

    // método interno para cambiar la fecha del gasto
    this.actualizarFecha = function(nuevaFechaStr) {
        if (typeof nuevaFechaStr !== "string") return;
        const parsed = Date.parse(nuevaFechaStr);
        if (!isNaN(parsed)) {
            this.fecha = parsed; // si la fecha es válida, se actualiza el timestamp
        }
    };

    // si se pasan etiquetas al crear el gasto, se añaden
    if (etiquetas && etiquetas.length) {
        this.anyadirEtiquetas(...etiquetas);
    }

    // método para mostrar la información del gasto en una línea
    this.mostrarGasto = function() {
      return "gasto correspondiente a " + this.descripcion +
             " con valor " + this.valor + " €" +
             " (fecha: " + new Date(this.fecha).toLocaleString() + ")" +
             " etiquetas: [" + this.etiquetas.join(", ") + "]";
    };

    // método para mostrar la información del gasto con más detalle
    this.mostrarGastoCompleto = function () {
      let texto = `gasto correspondiente a ${this.descripcion} con valor ${this.valor} €.\n`;
      texto += `fecha: ${new Date(this.fecha).toLocaleString()}\n`;
      texto += `etiquetas:\n`;

      this.etiquetas.forEach(tag => {
          // asegurar que la etiqueta es texto y está limpia
          const clean = (typeof tag === 'string')
              ? tag.replace(/^[\s-]+/, '').trim()
              : String(tag);
          texto += `- ${clean}\n`;
      });

      return texto;
    };

    // método para obtener un identificador de tiempo (día, mes o año) para agrupar
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
    
    // método para cambiar la descripción del gasto
    this.actualizarDescripcion = function(nuevaDescripcion){
      this.descripcion = nuevaDescripcion;
    };

    // método para cambiar el valor del gasto
    this.actualizarValor = function(nuevoValor){
        // se comprueba que el nuevo valor sea un número y no sea negativo
      if (typeof nuevoValor === "number" && nuevoValor >= 0){
        this.valor = nuevoValor;
      } else {
        console.log("error: el valor debe ser un numero negativo.")
      }
    };
}

// función que devuelve la lista completa de gastos guardados
function listarGastos() {
    return gastos;
}

// función para buscar gastos que cumplan varios criterios
function filtrarGastos(opts = {}) {
    const {
        fechaDesde,
        fechaHasta,
        valorMinimo,
        valorMaximo,
        descripcionContiene,
        etiquetasTiene
    } = opts || {};

    // convertir las fechas de texto a número (timestamp)
    const desdeTs = (typeof fechaDesde === "string") ? Date.parse(fechaDesde) : NaN;
    const hastaTs = (typeof fechaHasta === "string") ? Date.parse(fechaHasta) : NaN;

    // usar el método filter para crear una nueva lista solo con los gastos que cumplen todas las condiciones
    return gastos.filter(g => {
        if (!g) return false;

        // comprobación de fecha mínima
        if (!isNaN(desdeTs) && typeof g.fecha === "number") {
            if (g.fecha < desdeTs) return false;
        }

        // comprobación de fecha máxima
        if (!isNaN(hastaTs) && typeof g.fecha === "number") {
            if (g.fecha > hastaTs) return false;
        }

        // comprobación de valor mínimo
        if (typeof valorMinimo === "number") {
            if (typeof g.valor !== "number" || g.valor < valorMinimo) return false;
        }

        // comprobación de valor máximo
        if (typeof valorMaximo === "number") {
            if (typeof g.valor !== "number" || g.valor > valorMaximo) return false;
        }

        // comprobación de texto en la descripción
        if (typeof descripcionContiene === "string" && descripcionContiene.length) {
            const desc = (g.descripcion || "").toString().toLowerCase();
            if (desc.indexOf(descripcionContiene.toLowerCase()) === -1) return false;
        }

        // comprobación de etiquetas
        if (Array.isArray(etiquetasTiene) && etiquetasTiene.length) {
            // convertir las etiquetas buscadas a minúsculas
            const buscadas = etiquetasTiene
                .filter(t => typeof t === "string")
                .map(t => t.toLowerCase());
            // convertir las etiquetas del gasto a minúsculas
            const etiquetasGasto = Array.isArray(g.etiquetas) ? g.etiquetas.map(t => (t || "").toString().toLowerCase()) : [];
            // comprobar si alguna de las etiquetas buscadas está en el gasto
            const anyMatch = buscadas.some(b => etiquetasGasto.includes(b));
            if (!anyMatch) return false;
        }

        return true; // si pasa todas las comprobaciones, se incluye en la lista filtrada
    });
}

// función para sumar los gastos por período (día, mes o año)
function agruparGastos(periodo = "mes", etiquetas = [], fechaDesde, fechaHasta) {
    // asegurar que el período es válido
    if (typeof periodo !== "string" || !["dia", "mes", "anyo"].includes(periodo)) {
        periodo = "mes";
    }

    // convertir fechas de inicio y fin a timestamp
    const desdeTs = (typeof fechaDesde === "string" && !isNaN(Date.parse(fechaDesde))) ? Date.parse(fechaDesde) : null;
    const hastaTs = (typeof fechaHasta === "string" && !isNaN(Date.parse(fechaHasta))) ? Date.parse(fechaHasta) : Date.now();

    // preparar las etiquetas a buscar
    const buscadas = Array.isArray(etiquetas) && etiquetas.length
        ? etiquetas.filter(t => typeof t === "string").map(t => t.toLowerCase())
        : null;

    // 1. seleccionar solo los gastos que entran en el rango de fecha y etiquetas
    const seleccion = gastos.filter(g => {
        if (!g) return false;

        // filtro de fecha
        if (typeof g.fecha === "number") {
            if (desdeTs !== null && g.fecha < desdeTs) return false;
            if (typeof hastaTs === "number" && g.fecha > hastaTs) return false;
        }

        // filtro de etiquetas
        if (Array.isArray(buscadas) && buscadas.length) {
            const etiquetasGasto = Array.isArray(g.etiquetas)
                ? g.etiquetas.map(t => (t || "").toString().toLowerCase())
                : [];
            const anyMatch = buscadas.some(b => etiquetasGasto.includes(b));
            if (!anyMatch) return false;
        }

        return true;
    });

    // 2. sumar los gastos por período
    const resultado = {};
    seleccion.forEach(g => {
        // obtener la clave de agrupación (ej: "2024-05" para el mes)
        const key = (typeof g.obtenerPeriodoAgrupacion === "function") ? g.obtenerPeriodoAgrupacion(periodo) : "";
        if (!key) return;
        
        // si la clave no existe en el objeto resultado, se inicializa a 0
        if (!Object.prototype.hasOwnProperty.call(resultado, key)) resultado[key] = 0;
        
        const v = (typeof g.valor === "number") ? g.valor : 0;
        // sumar el valor del gasto al total de su período
        resultado[key] += v;
    });

    return resultado;
}

// función para añadir un nuevo objeto gasto a la lista global
function anyadirGasto(gasto) {
    // comprobar que lo que se recibe es un objeto
    if (typeof gasto !== "object" || gasto === null) {
        return null;
    }
    // asignar un id y aumentar el contador para el siguiente
    gasto.id = idGasto;
    idGasto++;
    gastos.push(gasto); // añadir el gasto a la lista
    return gasto;
}

// función para eliminar un gasto de la lista por su id
function borrarGasto(id) {
    // encontrar la posición (índice) del gasto en la lista
    const idx = gastos.findIndex(g => g && g.id === id);
    // si se encuentra (índice diferente de -1), se elimina 1 elemento en esa posición
    if (idx !== -1) {
        gastos.splice(idx, 1);
    }
}

// función para sumar el valor de todos los gastos
function calcularTotalGastos() {
    // usar reduce para sumar los valores de todos los gastos en la lista
    return gastos.reduce((sum, g) => {
        const v = (g && typeof g.valor === "number") ? g.valor : 0;
        return sum + v;
    }, 0); // el 0 inicial es la suma inicial
}

// función para calcular el dinero que queda (presupuesto - gastos)
function calcularBalance() {
    return presupuesto - calcularTotalGastos();
}

// exportar las funciones para que puedan ser usadas desde otros archivos (como la interfaz web)
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