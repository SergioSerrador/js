// TODO: Variables globales
let presupuesto = 0;
 
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
 
function CrearGasto(descripcion, valor) {
    // TODO
    if (typeof valor !== "number" || valor < 0 ){
        valor = 0
    }
   
    this.descripcion = descripcion;
    this.valor = valor;
 
    this.mostrarGasto = function(){
      return "Gasto correspondiente a " + this.descripcion + " con valor " + this.valor + " €";
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
 
// Exportación de funciones
export   {
    mostrarPresupuesto,
    actualizarPresupuesto,
    CrearGasto
}
 