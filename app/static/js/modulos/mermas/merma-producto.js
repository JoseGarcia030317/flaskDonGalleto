import { api } from "../../utils/api.js";
import { tabs } from "../../utils/tabs.js";
import { alertas } from "../../utils/alertas.js";

// ====================================================================
// Funciones para manejar el DOM y mostrar modales y alertas
// ====================================================================
// Funcion generica para abrir un modal en base a la clase hidden
function abrirModal(tipo) {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');

    backdrop.classList.remove('hidden');
    document.getElementById('modalTitulo').textContent =
        tipo === 'editar' ? 'Editar merma de producto' : 'Añadir merma de producto';
    modalForm.classList.remove('hidden');
}

// Función para filtrar la tabla
function filtrarTabla() {
    const textoBusqueda = document.querySelector('input[name="buscar"]').value.toLowerCase();
    const filas = document.querySelectorAll('#tbody_proveedores tr');
    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();

        if (textoFila.includes(textoBusqueda)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

// Cerrar modal al hacer clic fuera
// document.getElementById('modalBackdrop').addEventListener('click', (e) => {
//     if (e.target === document.getElementById('modalBackdrop')) {
//         cerrarModal();
//         limpiarFormulario();
//     }
// });

// Funcino para cerrar los distintos modales
function cerrarModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
    // limpiarFormulario();
}

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flak
// ====================================================================


// Exponer la función globalmente para poder ser usada en html
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.filtrarTabla = filtrarTabla;