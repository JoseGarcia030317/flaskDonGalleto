function abrirModal(tipo) {
    const backdrop = document.getElementById('modalBackdropInsumo');
    const modalForm = document.getElementById('modalFormInsumo');
    const modalEliminar = document.getElementById('modalEliminarInsumo');
    const modalExito = document.getElementById('modalExitoInsumo');

    backdrop.classList.remove('hidden');

    if (tipo === 'eliminar') {
        modalEliminar.classList.remove('hidden');
    } else if (tipo === 'exito') {
        modalExito.classList.remove('hidden')
    } else {
        modalForm.classList.remove('hidden');
        document.getElementById('modalTituloInsumo').textContent =
            tipo === 'editar' ? 'Editar insumo' : 'Añadir insumo';
    }
}

document.getElementById('modalBackdrop').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalBackdropInsumo')) {
        cerrarModal();
    }
});

function cerrarModal() {
    document.getElementById('modalBackdropInsumo').classList.add('hidden');
    document.getElementById('modalFormInsumo').classList.add('hidden');
    document.getElementById('modalEliminarInsumo').classList.add('hidden');
    document.getElementById('modalExitoInsumo').classList.add('hidden');
}