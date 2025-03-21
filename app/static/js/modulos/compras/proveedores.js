import { api } from '../../utils/api.js'
import { tabs } from '../../utils/tabs.js';

// ====================================================================
// Funciones para manejar el DOM y mostrar modales y alertas
// ====================================================================
// Funcion generica para abrir un modal en base a la clase hidden
function abrirModal(tipo) {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');

    backdrop.classList.remove('hidden');
    document.getElementById('modalTitulo').textContent =
        tipo === 'editar' ? 'Editar proveedor' : 'Añadir proveedor';
    modalForm.classList.remove('hidden');
}

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
    limpiarFormulario();
}

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flak
// ====================================================================
// Funcion para cargar los proveedores al iniciar la aplicacion
function cargarProveedores() {
    const tbody = document.getElementById('tbody_proveedores');
    tabs.mostrarEsqueletoTabla(tbody);
    
    api.getJSON('/provedores/get_all_proveedores')
        .then(data => {
            tbody.innerHTML = '';
            data.forEach(proveedor => {
                tbody.innerHTML += `
                <tr data-id="${proveedor.id_proveedor}" class="hover:bg-gray-50">
                    <td class="p-3 text-center">${proveedor.nombre}</td>
                    <td class="p-3 text-center">${proveedor.telefono}</td>
                    <td class="p-3 text-center">${proveedor.estatus == 1 ? 'Activo' : 'Inactivo'}</td>
                    <td class="p-3 flex justify-center">
                        <button onclick="buscarProveedorId(${proveedor.id_proveedor})" class="align-middle">
                            <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                        </button>
                        <button onclick="eliminarProveedor(${proveedor.id_proveedor})" class="align-middle">
                            <img src="../../../static/images/bote basura.png" class="w-7 h-7">
                        </button>
                    </td>
                </tr>
            `;
            });
            limpiarFormulario();
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message, 'error');
        });
}

// Funcion para crear o modificar un proveedor
function guardarProveedor() {
    const formData = {
        nombre: document.querySelector('input[name="nombre"]').value,
        telefono: document.querySelector('input[name="telefono"]').value,
        contacto: document.querySelector('input[name="contacto"]').value,
        correo_electronico: document.querySelector('input[name="email"]').value,
        estatus: 1,
        descripcion_servicio: document.querySelector('textarea[name="descripcion"]').value
    };

    // Si es modificar
    const id_proveedor = document.querySelector('input[name="proveedor_id"]').value;
    let endpoint = id_proveedor != 0 ? '/provedores/update_proveedor' : '/provedores/create_proveedor';
    let payload = id_proveedor != 0 ? {...formData, id_proveedor} : formData;

    api.postJSON(endpoint, payload)
        .then(data => {
            if (data.id_proveedor) {
                cerrarModal();
                procesoTerminadoExito();
                cargarProveedores();
                limpiarFormulario();
            } else {
                alert('Error al crear proveedor: ' + (data.error || 'Error desconocido'));
            }
        })
        .catch(error => {
            console.error('Error en la petición:', error);
            alert('Error al crear proveedor');
        });
}

// Funcion para eliminar de manera logica un proveedor
function eliminarProveedor(id_proveedor) {
    confirmarEliminar()
    .then(resultado => {
        if (!resultado.isConfirmed) {
            return Promise.reject('cancelado');
        }
        return api.postJSON('/provedores/delete_proveedor', {id_proveedor : id_proveedor});
    })
    .then(data => {
        if (data.id_proveedor) {
            procesoTerminadoExito()
            cargarProveedores();
            limpiarFormulario();
        } else {
            Swal.fire('Error', data.error || 'Error al eliminar proveedor', 'error');
        }
    })
    .catch(error => {
        if (error !== 'cancelado') {
            console.error('Error:', error.message || error);
            Swal.fire('Error', error.message || 'Error al eliminar', 'error');
        }
    });
}

function buscarProveedorId(id_proveedor) {
    api.postJSON('/provedores/get_proveedor_byId', {id_proveedor : id_proveedor})
    .then(data => {
        if (data) {
            abrirModal('editar');
            document.querySelector('input[name="proveedor_id"').value = data.id_proveedor;
            document.querySelector('input[name="nombre"]').value = data.nombre;
            document.querySelector('input[name="telefono"]').value = data.telefono;
            document.querySelector('input[name="contacto"]').value = data.contacto;
            document.querySelector('input[name="email"]').value = data.correo_electronico;
            document.querySelector('textarea[name="descripcion"]').value = data.descripcion_servicio;
        }
    })
    .catch(error => {
        console.error('Error:', error.message);
        Swal.fire('Error', error.message || 'Error al cargar insumo', 'error');
    });
}

function limpiarFormulario() {
    document.querySelector('input[name="nombre"]').value = '';
    document.querySelector('input[name="telefono"]').value = '';
    document.querySelector('input[name="contacto"]').value = '';
    document.querySelector('input[name="email"]').value = '';
    document.querySelector('textarea[name="descripcion"]').value = '';

    document.querySelector('input[name="proveedor_id"]').value = 0;
}

// ====================================================================
// Funciones para realizar validaciones del lado del Cliente
// ====================================================================

// Exponer la función globalmente para poder ser usada en html
window.cargarProveedores = cargarProveedores;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.guardarProveedor = guardarProveedor;
window.filtrarTabla = filtrarTabla;
window.eliminarProveedor = eliminarProveedor;
window.buscarProveedorId = buscarProveedorId;