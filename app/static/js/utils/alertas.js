function confirmarEliminar() {
    return Swal.fire({
        title: "¿Estás seguro que deseas eliminar el registro?",
        imageUrl: "../../../static/images/warning.png",
        imageWidth: 128,
        imageHeight: 128,
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3C1D0C',
        cancelButtonColor: '#6c757d'
    });

}

function confirmarYRegistrarVenta() {
    return Swal.fire({
      title: '¿Confirmas la venta?',
      text: 'Estas por generar una nueva venta',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Registrar venta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3C1D0C',
      cancelButtonColor: '#6c757d'
    });
  }

function procesoTerminadoExito() {
    Swal.fire({
        position: "center",
        icon: "success",
        title: "Proceso realizado con exito",
        showConfirmButton: false,
        timer: 1500
    });
}

function alertaWarning(mensaje) {
    console.log("mensaje: " + mensaje);
    Swal.fire({
        position: "center",
        icon: "warning",
        title: mensaje,
        showConfirmButton: false,
        timer: 1500
    });
}

function procesoTerminadoSinExito() {
    Swal.fire({
        position: 'center',
        icon: "error",
        title: "Ha ocurrido un error, intentalo más tarde",
        showConfirmButton: false,
        timer: 1500
    });
}

function alertaRecetas(texto) {
    Swal.fire({
        position: 'center',
        icon: "warning",
        title: texto,
        showConfirmButton: false,
        timer: 1500
    });
}

function alertaAumentoCostoProduccion(aumento, nuevoPrecio) {
    return Swal.fire({
        title: '¡Costo de producción aumentó!',
        html: `El costo de producción por galleta aumentó <strong>$${aumento}</strong>.
             <br>El nuevo precio sugerido es <strong>$${nuevoPrecio}</strong>.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Actualizar precio',
        cancelButtonText: 'Dejar como está',
        confirmButtonColor: '#3C1D0C',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        return result.isConfirmed;
    });
}

function alertaCambioMargen(costoUnitario, nuevoPrecio) {
    return Swal.fire({
        title: '!Precio de venta afectado!',
        html: `El costo de producción de la galleta ahora es $<strong>$${costoUnitario}</strong>.
             <br>El nuevo precio de venta sugerido sería $ <strong>$${nuevoPrecio}</strong>.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Actualizar precio',
        cancelButtonText: 'Mantener precio actual',
        confirmButtonColor: '#3C1D0C',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        return result.isConfirmed;
    });
}

function alertaFaltaDeInsumos(texto) {
    return Swal.fire({
        title: '¡Insumos insuficientes!',
        html: `Para realizar la acción, es necesaria la compra de: <br> <strong>${texto}</strong>.`,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3C1D0C',
    })
}

function corteCajaInicio() {
    return Swal.fire({ // ¡Debe retornar directamente la promesa!
        title: 'Corte de caja inicial requerido',
        input: 'number',
        inputLabel: 'No hay un corte de caja registrado. Ingrese el monto inicial de efectivo',
        inputPlaceholder: 'Ejemplo: 1500.00',
        inputAttributes: {
            min: "0",
            step: "0.01"
        },
        showCancelButton: true,
        confirmButtonText: 'Iniciar turno',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3C1D0C',
        cancelButtonColor: '#6c757d',
        inputValidator: (value) => {
            if (!value) return 'Debe ingresar un monto inicial';
            if (parseFloat(value) <= 0) return 'El monto debe ser mayor a cero!';
        }
    });
}

export const alertas = {
    confirmarEliminar: () => confirmarEliminar(),
    procesoTerminadoExito: () => procesoTerminadoExito(),
    alertaWarning: (mensaje) => alertaWarning(mensaje),
    procesoTerminadoSinExito: () => procesoTerminadoSinExito(),
    alertaRecetas: (texto) => alertaRecetas(texto),
    alertaCambioMargen: (costoUnitario, nuevoPrecio) => alertaCambioMargen(costoUnitario, nuevoPrecio),
    alertaAumentoCostoProduccion: (aumento, nuevoPrecio) => alertaAumentoCostoProduccion(aumento, nuevoPrecio),
    procesoTerminadoSinExito: () => procesoTerminadoSinExito(),
    corteCajaInicio : () => corteCajaInicio(),
    confirmarYRegistrarVenta : () => confirmarYRegistrarVenta(),
    alertaFaltaDeInsumos: (mensaje) => alertaFaltaDeInsumos(mensaje)
}