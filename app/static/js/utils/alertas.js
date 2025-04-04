function confirmarEliminar() {
    return Swal.fire({
        title: "¿Estás seguro que deseas eliminar el registro?",
        imageUrl: "../../../static/images/warning.png",
        imageWidth: 128,
        imageHeight: 128,
        showCancelButton: true,
        confirmButtonText: '<span class="text-lg font-medium">Aceptar</span>',
        cancelButtonText: '<span class="text-lg font-medium">Cancelar</span>',
        customClass: {
            confirmButton: "flex items-center gap-3 px-6 py-3 border-2 border-[#8A5114] bg-white text-[#8A5114] rounded-full hover:bg-[#f5f5f5] transition-colors",
            cancelButton: "flex items-center gap-3 px-6 py-3 border-2 border-[#DAA520] bg-white text-[#DAA520] rounded-full hover:bg-[#f5f5f5] transition-colors"
        }
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
        showConfirmButton : false,
        timer : 1500
      });
}

function alertaRecetas(texto) {
    Swal.fire({
        position: 'center',
        icon: "warning",
        title: texto,
        showConfirmButton : false,
        timer : 1500
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

export const alertas = {
    confirmarEliminar : () => confirmarEliminar(),
    procesoTerminadoExito : () => procesoTerminadoExito(),
    alertaWarning : (mensaje) => alertaWarning(mensaje),
    procesoTerminadoSinExito : () => procesoTerminadoSinExito(),
    alertaRecetas : (texto) => alertaRecetas(texto),
    alertaCambioMargen : (costoUnitario, nuevoPrecio) => alertaCambioMargen(costoUnitario, nuevoPrecio),
    alertaAumentoCostoProduccion : (aumento, nuevoPrecio) => alertaAumentoCostoProduccion(aumento, nuevoPrecio)
}