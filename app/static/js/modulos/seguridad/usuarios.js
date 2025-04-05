import { api } from "../../utils/api.js";
import { tabs } from "../../utils/tabs.js";
import { alertas } from "../../utils/alertas.js";
import { validarCaracteresProhibidos, validarSelectRequerido, mostrarErrores, validarRequerido, validarLongitud, limpiarErrores, validarSoloNumeros } from "../../utils/validaciones.js";


function cargarUsuarios(){
    obtener_usuarios();
}

function obtener_usuarios(){
    const tbody = document.getElementById('tbody_usuario');

    api.getJSON('/usuarios/get_user_all')
    .then(data => {
        if (data && Array.isArray(data)) {
            data.forEach(usuario => {
                const tr = document.createElement('tr');

                const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido_pat || ''} ${usuario.apellido_mat || ''}`.trim();

                tr.innerHTML = `
                    <td class="p-3 text-center">${nombreCompleto}</td>
                    <td class="p-3 text-center">${usuario.telefono}</td>
                    <td class="p-3 text-center">${usuario.tipo || ''}</td>
                    <td class="p-3 text-center">${usuario.usuario || ''}</td>
                    <td class="p-3 flex justify-center">
                        <button class="align-middle cursor-pointer">
                            <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                        </button>
                        <button class="align-middle cursor-pointer">
                            <img src="../../../static/images/bote basura.png" class="w-7 h-7">
                        </button>
                    </td>
                `;

                tbody.appendChild(tr);
            })
        }  
    })
    .catch(error => {
        console.error('Error:', error.message);
        Swal.fire('Error', error.message || 'Error al cargar los usuarios', 'error');
    });
}

// ====================================================================
// Funciones para manejar el DOM y mostrar modales y alertas
// ====================================================================
function abrirModal(tipo) {
    const backdrop = document.getElementById('modalBackdropUsuarios');
    backdrop.classList.remove('hidden');
    let modalForm;  
    if (tipo === 'agregar') {
        modalForm = document.getElementById('modalFormA');
    } else {
        modalForm = document.getElementById('modalFormE');
    }
    modalForm.classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modalBackdropUsuarios').classList.add('hidden');
    document.getElementById('modalFormA').classList.add('hidden');
    document.getElementById('modalFormE').classList.add('hidden');
}

function filtrarTabla() {
    const textoBusqueda = document.querySelector('input[name="buscar"]').value.toLowerCase();
    const filas = document.querySelectorAll('#tbody_usuario tr');
    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();

        if (textoFila.includes(textoBusqueda)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

window.cargarUsuarios = cargarUsuarios;
window.obtener_usuarios =  obtener_usuarios;
window.filtrarTabla = filtrarTabla

window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;