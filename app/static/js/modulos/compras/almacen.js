function cargarAlmacen() {  
    const tbody = document.getElementById('tbody_almacen');
}

function abrirModal(tipo){
    const backdrop = document.getElementById('modalBackdropAlmacen');
    const modalForm = document.getElementById('modalFormAlmacen');

    backdrop.classList.remove('hidden');
    modalForm.classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modalBackdropAlmacen').classList.add('hidden');
    document.getElementById('modalFormAlmacen').classList.add('hidden');
    limpiarFormulario();
}

window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.cargarAlmacen = cargarAlmacen;
