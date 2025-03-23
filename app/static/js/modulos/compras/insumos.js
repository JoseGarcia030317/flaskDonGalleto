import { api } from '../../utils/api.js'
import { tabs } from '../../utils/tabs.js'
import { alertas } from '../../utils/alertas.js';

// ====================================================================
// Funciones para manejar el DOM y mostrar modales
// ====================================================================
function abrirModal(tipo) {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');

    backdrop.classList.remove('hidden');

    document.getElementById('modalTitulo').textContent =
        tipo === 'editar' ? 'Editar insumo' : 'Añadir insumo';
    modalForm.classList.remove('hidden')
}

// Función para filtrar la tabla
function filtrarTabla() {
    const textoBusqueda = document.querySelector('input[name="buscar"]').value.toLowerCase();
    const filas = document.querySelectorAll('#tbody_insumos tr');
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
//     }
// });

// Funcino para cerrar los distintos modales
function cerrarModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
    limpiarFormulario();
}

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flak
// ====================================================================
function cargarSelectUnidad() {
    const select = document.getElementById('cmb_unidad')

    api.getJSON('/unidad/get_all_unidad')
    .then(data => {
        select.innerHTML = '<option value="">Seleccione una unidad</option>';
        data.forEach(tipo => {
            select.innerHTML += `
                    <option value="${tipo.id_unidad}">
                        ${tipo.nombre} (${tipo.simbolo})
                    </option>`;
        })
    })
    .catch(error => {
        console.error('Error:', error.message);
        Swal.fire('Error', error.message || 'Error al cargar unidades', 'error');
    })
}

function cargarInsumos() {
    const tbody = document.getElementById('tbody_insumos');
    tabs.mostrarEsqueletoTabla(tbody)
    cargarSelectUnidad()

    api.getJSON('/insumos/get_all_insumos_unidad')
    .then(data => {
        tbody.innerHTML = '';

        data.forEach(insumo => {
            tbody.innerHTML += `
            <tr data-id="${insumo.id_insumo}" class="hover:bg-gray-100">
                <td class="p-3 text-center">${insumo.nombre}</td>
                <td class="p-3 text-center">${insumo.descripcion}</td>
                <td class="p-3 text-center">${insumo.unidad.nombre + ' (' + insumo.unidad.simbolo + ')'}</td>
                <td class="p-3 flex justify-center">
                    <button onclick="buscarInsumoId(${insumo.id_insumo})" class="align-middle cursor-pointer">
                        <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                    </button>
                    <button onclick="eliminarInsumo(${insumo.id_insumo})" class="align-middle cursor-pointer">
                        <img src="../../../static/images/bote basura.png" class="w-7 h-7">
                    </button>
                </td>
            </tr>
        `;
        });
        limpiarFormulario();
        document.getElementById('btn-agregar').disabled = false;
    })
    .catch(error => {
        console.error('Error:', error.message);
        Swal.fire('Error', error.message || 'Error al cargar insumos', 'error');
    })
    .finally(() => tabs.desbloquearTabs());

}

function guardarInsumo() {
    const formData = {
        nombre: document.querySelector('input[name="nombre"]').value,
        descripcion: document.querySelector('input[name="descripcion"]').value,
        unidad_id: parseInt(document.getElementById('cmb_unidad').value),
    };

    // Si es modificar
    const id_insumo = document.getElementById('insumo_id').value;
    const endpoint = id_insumo != 0 ? '/insumos/update_insumo' : '/insumos/create_insumo';
    let payload = id_insumo != 0 ? {...formData, id_insumo} : formData;

    tabs.mostrarLoader();
    api.postJSON(endpoint, payload)
    .then(data => {
        if (data.id_insumo) {
            cerrarModal();
            alertas.procesoTerminadoExito();
            cargarInsumos();
            limpiarFormulario();
        } else {
            alert('Error al guardar el insumo: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error:', error.message);
        Swal.fire('Error', error.message || 'Error al guardar insumo', 'error');
    })
    .finally(() => tabs.ocultarLoader());
}

function eliminarInsumo(id_insumo) {
    alertas.confirmarEliminar()
    .then(resultado => {
        if (!resultado.isConfirmed) {
            return Promise.reject('cancelado');
        }
        tabs.mostrarLoader();
        return api.postJSON('/insumos/delete_insumo', {id_insumo : id_insumo});
    })
    .then(data => {
        if (data.id_insumo) {
            alertas.procesoTerminadoExito()
            cargarInsumos();
            limpiarFormulario();
        } else {
            Swal.fire('Error', data.error || 'Error al eliminar insumo', 'error');
        }
    })
    .catch(error => {
        if (error !== 'cancelado') {
            console.error('Error:', error.message || error);
            Swal.fire('Error', error.message || 'Error al eliminar', 'error');
        }
    })
    .finally(() => tabs.ocultarLoader());

}

function buscarInsumoId(id_insumo) {
    tabs.mostrarLoader();
    api.postJSON('/insumos/get_insumo_unidad_byId', {id_insumo})
    .then(data => {
        if(data) {
            abrirModal('editar');
            const select = document.getElementById('cmb_unidad');
            select.innerHTML = `<option value="${data.unidad.id_unidad}">
                                  ${data.unidad.nombre} (${data.unidad.simbolo})
                               </option>`;

            document.getElementById('insumo_id').value = data.id_insumo;
            document.querySelector('input[name="nombre"]').value = data.nombre;
            document.querySelector('input[name="descripcion"]').value = data.descripcion;
        }

    })
    .catch(error => {
        console.error('Error:', error.message);
        Swal.fire('Error', error.message || 'Error al cargar insumo', 'error');
    })
    .finally(() => tabs.ocultarLoader());
}

function limpiarFormulario() {
    document.querySelector('input[name="nombre"]').value = '';
    document.querySelector('input[name="descripcion"]').value = '';

    cargarSelectUnidad();

    document.getElementById('insumo_id').value = 0;
}

// Exponer la función globalmente
window.cargarInsumos = cargarInsumos;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.guardarInsumo = guardarInsumo;
window.filtrarTabla = filtrarTabla;
window.eliminarInsumo = eliminarInsumo;
window.buscarInsumoId = buscarInsumoId;