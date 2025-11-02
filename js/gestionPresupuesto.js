import {
  CrearGasto,
  anyadirGasto,
  borrarGasto,
  listarGastos,
  actualizarPresupuesto,
  calcularTotalGastos,
  calcularBalance
} from './gestionPresupuesto.js'; // importar las funciones de la lógica del negocio

// esperar a que el documento html esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  inicializarInterfaz();
});

// función que arranca la aplicación de la interfaz
function inicializarInterfaz() {
  crearFormularioPresupuesto(); // configurar el formulario para el presupuesto
  crearFormularioGasto();       // crear y configurar el formulario para añadir gastos
  actualizarListado();          // mostrar los gastos y los totales iniciales
}

// función para configurar el formulario de actualización del presupuesto
function crearFormularioPresupuesto() {
  // obtener el input y el botón del html
  const inputPresupuesto = document.getElementById('inputPresupuesto');
  const btn = document.getElementById('btnActualizarPresupuesto');

  // escuchar el click en el botón
  btn.addEventListener('click', () => {
    const valor = parseFloat(inputPresupuesto.value); // convertir el texto del input a número

    // comprobar que el valor sea un número válido y no negativo
    if (!isNaN(valor) && valor >= 0) {
      actualizarPresupuesto(valor); // llamar a la función de la lógica
      actualizarListado();          // refrescar la vista para actualizar el balance
      alert(`presupuesto actualizado a ${valor.toFixed(2)} €`);
    } else {
      alert("introduce un valor válido para el presupuesto");
    }
  });
}

// función para crear el formulario de añadir gasto
function crearFormularioGasto() {
  const contenedor = document.getElementById('formularioGasto');
  contenedor.innerHTML = ''; // limpiar el contenedor por si acaso
  const form = document.createElement('form'); // crear la etiqueta form

  // crear los campos de input
  const inputDescripcion = document.createElement('input');
  inputDescripcion.type = 'text';
  inputDescripcion.placeholder = 'descripción';
  inputDescripcion.required = true;

  const inputValor = document.createElement('input');
  inputValor.type = 'number';
  inputValor.placeholder = 'valor (€)';
  inputValor.required = true;
  inputValor.step = '0.01'; // permitir dos decimales

  const inputFecha = document.createElement('input');
  inputFecha.type = 'date';
  inputFecha.required = true;

  const inputEtiquetas = document.createElement('input');
  inputEtiquetas.type = 'text';
  inputEtiquetas.placeholder = 'etiquetas (coma separadas)';

  const boton = document.createElement('button'); // crear el botón de enviar
  boton.type = 'submit';
  boton.textContent = 'añadir gasto';

  // añadir todos los elementos al formulario
  form.append(inputDescripcion, inputValor, inputFecha, inputEtiquetas, boton);
  // añadir el formulario al contenedor en el html
  contenedor.appendChild(form);

  // escuchar el evento de envío del formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // evitar que la página se recargue

    // obtener los valores de los inputs
    const descripcion = inputDescripcion.value.trim();
    const valor = parseFloat(inputValor.value);
    const fecha = inputFecha.value;
    // procesar las etiquetas: separarlas por coma, limpiar espacios y quitar vacías
    const etiquetas = inputEtiquetas.value
      ? inputEtiquetas.value.split(',').map(t => t.trim()).filter(t => t)
      : [];

    // comprobación mínima de datos
    if (!descripcion || isNaN(valor) || !fecha) {
      alert("completa todos los campos correctamente");
      return;
    }

    // crear el objeto gasto. '...' (spread) para pasar las etiquetas como argumentos
    const gasto = new CrearGasto(descripcion, valor, fecha, ...etiquetas);
    
    anyadirGasto(gasto);     // guardar el gasto usando la lógica de negocio
    form.reset();            // limpiar el formulario
    actualizarListado();     // refrescar la lista de gastos
  });
}

// función para dibujar la lista de gastos y actualizar los totales
function actualizarListado() {
  const contenedor = document.getElementById('listadoGastos');
  contenedor.innerHTML = ''; // limpiar el contenido anterior
  const gastos = listarGastos(); // obtener la lista actual

  if (gastos.length === 0) {
    contenedor.textContent = 'no hay gastos registrados.';
  } else {
    // recorrer cada gasto en la lista
    gastos.forEach(g => {
      const div = document.createElement('div'); // crear un contenedor para cada gasto
      
      const info = document.createElement('span'); // crear un elemento para la información
      // formatear la información del gasto (descripción, valor, fecha y etiquetas)
      info.textContent = `${g.descripcion} - ${g.valor.toFixed(2)} € - ${new Date(g.fecha).toLocaleDateString()} - ${g.etiquetas.join(', ')}`;
      
      const btnBorrar = document.createElement('button');
      btnBorrar.textContent = 'borrar';
      
      // configurar el botón de borrado
      btnBorrar.addEventListener('click', () => {
        // pedir confirmación antes de eliminar
        if (confirm(`¿seguro que quieres borrar el gasto "${g.descripcion}"?`)) {
          borrarGasto(g.id);       // llamar a la función de borrado por id
          actualizarListado();     // refrescar la lista
        }
      });
      
      div.append(info, btnBorrar); // añadir la info y el botón al div del gasto
      contenedor.appendChild(div); // añadir el gasto al contenedor principal
    });
  }
  
  // actualizar el contenido de los totales en el html
  document.getElementById('totalGastos').textContent = `total gastos: ${calcularTotalGastos().toFixed(2)} €`;
  document.getElementById('balance').textContent = `balance: ${calcularBalance().toFixed(2)} €`;
}