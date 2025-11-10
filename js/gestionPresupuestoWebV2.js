// importo el otro archivo donde está la parte de la lógica
import {
  CrearGasto,
  anyadirGasto,
  borrarGasto,
  listarGastos,
  actualizarPresupuesto,
  calcularTotalGastos,
  calcularBalance
} from './gestionPresupuesto.js';

// cuando la página se cargue
document.addEventListener('DOMContentLoaded', () => {
  iniciar();
});

// función principal para arrancar todo
function iniciar() {
  ponerBotonPresupuesto();
  ponerFormularioGasto();
  refrescarLista();
}

// esto es para actualizar el presupuesto
function ponerBotonPresupuesto() {
  const btn = document.getElementById('btnActualizarPresupuesto');
  const input = document.getElementById('inputPresupuesto');

  btn.addEventListener('click', () => {
    const valor = parseFloat(input.value);
    if (!isNaN(valor) && valor >= 0) {
      actualizarPresupuesto(valor);
      refrescarLista();
    } else {
      alert('pon un número válido');
    }
  });
}

// esto crea el formulario para añadir gastos
function ponerFormularioGasto() {
  const contenedor = document.getElementById('formularioGasto');
  const form = document.createElement('form');

  const desc = document.createElement('input');
  desc.placeholder = 'descripción';
  desc.required = true;

  const valor = document.createElement('input');
  valor.type = 'number';
  valor.placeholder = 'valor (€)';
  valor.step = '0.01';
  valor.required = true;

  const fecha = document.createElement('input');
  fecha.type = 'date';
  fecha.required = true;

  const etiquetas = document.createElement('input');
  etiquetas.placeholder = 'etiquetas (coma separadas)';

  const btn = document.createElement('button');
  btn.textContent = 'añadir gasto';

  form.append(desc, valor, fecha, etiquetas, btn);
  contenedor.appendChild(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const descripcion = desc.value.trim();
    const v = parseFloat(valor.value);
    const f = fecha.value;
    const tags = etiquetas.value ? etiquetas.value.split(',').map(t => t.trim()) : [];

    const g = new CrearGasto(descripcion, v, f, ...tags);
    anyadirGasto(g);
    form.reset();
    refrescarLista();
  });
}

// aquí se refresca la lista entera de gastos
function refrescarLista() {
  const cont = document.getElementById('listadoGastos');
  cont.innerHTML = '';

  const gastos = listarGastos();

  if (gastos.length === 0) {
    cont.textContent = 'no hay gastos todavía';
  } else {
    gastos.forEach(g => {
      // aquí creo un componente personalizado mi-gasto
      const miGasto = document.createElement('mi-gasto');
      miGasto.gasto = g;
      miGasto.addEventListener('borrado', refrescarLista);
      miGasto.addEventListener('editado', refrescarLista);
      cont.appendChild(miGasto);
    });
  }

  // actualizo los totales
  document.getElementById('totalGastos').textContent = `total gastos: ${calcularTotalGastos().toFixed(2)} €`;
  document.getElementById('balance').textContent = `balance: ${calcularBalance().toFixed(2)} €`;
}

// este es el componente personalizado
class MiGasto extends HTMLElement {
  constructor() {
    super();
    // aquí se hace el shadow dom
    this.shadow = this.attachShadow({ mode: 'open' });

    const plantilla = document.getElementById('plantillaGasto');
    const copia = plantilla.content.cloneNode(true);
    this.shadow.appendChild(copia);
  }

  // cada vez que le ponga un gasto, se muestra
  set gasto(g) {
    this._gasto = g;
    this.mostrarGasto();
  }

  get gasto() {
    return this._gasto;
  }

  // aquí pongo todos los datos del gasto en la plantilla
  mostrarGasto() {
    const d = this.shadow.querySelector('.descripcion');
    const v = this.shadow.querySelector('.valor');
    const f = this.shadow.querySelector('.fecha');
    const e = this.shadow.querySelector('.etiquetas');

    d.textContent = `descripción: ${this._gasto.descripcion}`;
    v.textContent = `valor: ${this._gasto.valor.toFixed(2)} €`;
    f.textContent = `fecha: ${new Date(this._gasto.fecha).toLocaleDateString('es-es')}`;
    e.textContent = `etiquetas: [${this._gasto.etiquetas.join(', ')}]`;

    this.configurarBotones();
  }

  // aquí van los botones de editar y borrar
  configurarBotones() {
    const btnBorrar = this.shadow.querySelector('.btnBorrar');
    const btnEditar = this.shadow.querySelector('.btnEditar');
    const formEditar = this.shadow.querySelector('.form-editar');
    const btnCancelar = this.shadow.querySelector('.btnCancelar');

    btnBorrar.onclick = () => {
      if (confirm(`¿quieres borrar el gasto "${this._gasto.descripcion}"?`)) {
        borrarGasto(this._gasto.id);
        this.dispatchEvent(new CustomEvent('borrado', { bubbles: true }));
      }
    };

    btnEditar.onclick = () => {
      formEditar.style.display = formEditar.style.display === 'none' ? 'block' : 'none';
      this.llenarFormularioEdicion();
    };

    btnCancelar.onclick = () => {
      formEditar.style.display = 'none';
    };

    formEditar.onsubmit = (e) => {
      e.preventDefault();
      const desc = this.shadow.querySelector('.editarDescripcion').value.trim();
      const valor = parseFloat(this.shadow.querySelector('.editarValor').value);
      const fecha = this.shadow.querySelector('.editarFecha').value;
      const etiquetas = this.shadow.querySelector('.editarEtiquetas').value.split(',').map(t => t.trim()).filter(Boolean);

      this._gasto.descripcion = desc;
      this._gasto.valor = valor;
      this._gasto.actualizarFecha(fecha);
      this._gasto.etiquetas = etiquetas;

      formEditar.style.display = 'none';
      this.mostrarGasto();
      this.dispatchEvent(new CustomEvent('editado', { bubbles: true }));
    };
  }

  // cuando abro el formulario de editar, lleno los datos actuales
  llenarFormularioEdicion() {
    this.shadow.querySelector('.editarDescripcion').value = this._gasto.descripcion;
    this.shadow.querySelector('.editarValor').value = this._gasto.valor;
    const fechaISO = new Date(this._gasto.fecha).toISOString().split('T')[0];
    this.shadow.querySelector('.editarFecha').value = fechaISO;
    this.shadow.querySelector('.editarEtiquetas').value = this._gasto.etiquetas.join(', ');
  }
}

// registro el componente
customElements.define('mi-gasto', MiGasto);
