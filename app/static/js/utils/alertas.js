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
            confirmButton: "gap-3 px-6 py-3 border border-[#301e1a] bg-white text-[#301e1a] rounded-full hover:bg-[#f5f5f5] transition-colors",
            cancelButton: "gap-3 px-6 py-3 borderborder-[#301e1a] bg-white text-[#301e1a] rounded-full hover:bg-[#f5f5f5] transition-colors"
        }
    });

}

function procesoTerminadoExito() {
    Swal.fire({
        position: "center",
        icon: "success",
        title: "Proceso realizado con exito",
        showConfirmButton: false,
        timer: 1800
    });
}

export const alertas = {
    procesoTerminadoExito : () => procesoTerminadoExito(),
    confirmarEliminar : () => confirmarEliminar()
}