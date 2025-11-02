import {
  CrearGasto,
  anyadirGasto,
  borrarGasto,
  listarGastos,
  actualizarPresupuesto,
  calcularTotalGastos,
  calcularBalance
} from './gestionPresupuesto.js'; // importar la lógica de negocio

// esperar a que todo el html esté cargado antes de manipular el dom
document.addEventListener('DOMContentLoaded', () => {
  inicializarInterfaz();
});

// función principal que configura la página
function inicializarInterfaz() {
  crearFormularioPresupuesto(); // configurar el manejo del presupuesto (función extra)
  crearFormularioGasto();       // crear y configurar el formulario de gastos
  actualizarListado();          // mostrar los gastos y totales iniciales
}

// función para manejar la actualización del presupuesto
function crearFormularioPresupuesto() {
  const inputPresupuesto = document.getElementById('inputPresupuesto');
  const btn = document.getElementById('btnActualizarPresupuesto');

  btn.addEventListener('click', () => {
    const valor = parseFloat(inputPresupuesto.value);
    
    if (!isNaN(valor) && valor >= 0) {
      actualizarPresupuesto(valor);
      actualizarListado(); // refrescar la vista para actualizar el balance
    } else {
      alert("introduce un valor válido para el presupuesto");
    }
  });
}

// función para crear el formulario de añadir gasto y configurar su envío
function crearFormularioGasto() {
  const contenedor = document.getElementById('formularioGasto');
  contenedor.innerHTML = ''; 
  const form = document.createElement('form');

  // 1. campo descripción
  const inputDescripcion = document.createElement('input');
  inputDescripcion.type = 'text';
  inputDescripcion.placeholder = 'descripción';
  inputDescripcion.required = true;

  // 2. campo valor
  const inputValor = document.createElement('input');
  inputValor.type = 'number';
  inputValor.placeholder = 'valor (€)';
  inputValor.required = true;
  inputValor.step = '0.01';

  // 3. campo fecha
  const inputFecha = document.createElement('input');
  inputFecha.type = 'date';
  inputFecha.required = true;

  // 4. campo etiquetas
  const inputEtiquetas = document.createElement('input');
  inputEtiquetas.type = 'text';
  inputEtiquetas.placeholder = 'etiquetas (coma separadas)';

  // 5. botón de envío
  const boton = document.createElement('button');
  boton.type = 'submit';
  boton.textContent = 'añadir gasto';

  // añadir todos los elementos al formulario
  form.append(inputDescripcion, inputValor, inputFecha, inputEtiquetas, boton);
  // añadir el formulario al contenedor en el html
  contenedor.appendChild(form);

  // procesar el envío del formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // prevenir que la página se recargue

    // obtener los valores y parsear
    const descripcion = inputDescripcion.value.trim();
    const valor = parseFloat(inputValor.value);
    const fecha = inputFecha.value;
    
    // procesar etiquetas: separarlas, limpiar espacios y filtrar vacías
    const etiquetas = inputEtiquetas.value
      ? inputEtiquetas.value.split(',').map(t => t.trim()).filter(t => t)
      : [];
    
    // crear y añadir el gasto a la lógica de negocio
    const gasto = new CrearGasto(descripcion, valor, fecha, ...etiquetas);
    anyadirGasto(gasto);
    
    form.reset();       // limpiar el formulario
    actualizarListado(); // refrescar la lista y los totales
  });
}

// función para mostrar el listado de gastos y actualizar los totales
function actualizarListado() {
  const contenedor = document.getElementById('listadoGastos');
  contenedor.innerHTML = ''; // limpiar la lista anterior
  
  const gastos = listarGastos(); // obtener la lista actualizada de la lógica de negocio

  if (gastos.length === 0) {
    contenedor.textContent = 'no hay gastos registrados.';
  } else {
    // crear una estructura para cada gasto
    gastos.forEach(g => {
      const div = document.createElement('div');
      
      // mostrar datos del gasto
      const fechaFormateada = new Date(g.fecha).toLocaleDateString('es-es');
      const info = document.createElement('span');
      info.textContent = `${g.descripcion} - ${g.valor.toFixed(2)} € - ${fechaFormateada} - [${g.etiquetas.join(', ')}]`;
      
      // crear botón de borrado
      const btnBorrar = document.createElement('button');
      btnBorrar.textContent = 'borrar';
      
      // configurar la acción de borrado
      btnBorrar.addEventListener('click', () => {
        // pedir confirmación antes de borrar
        if (confirm(`¿seguro que quieres borrar el gasto "${g.descripcion}"?`)) {
          borrarGasto(g.id);       // llamar a la función de borrado de la lógica
          actualizarListado();     // refrescar la interfaz
        }
      });
      
      div.append(info, btnBorrar);
      contenedor.appendChild(div);
    });
  }
  
  // actualizar las capas de totales y balance
  document.getElementById('totalGastos').textContent = `total gastos: ${calcularTotalGastos().toFixed(2)} €`;
  document.getElementById('balance').textContent = `balance: ${calcularBalance().toFixed(2)} €`;
}