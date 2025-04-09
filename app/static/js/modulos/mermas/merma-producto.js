import { api } from "../../utils/api.js";
import { tabs } from "../../utils/tabs.js";
import { alertas } from "../../utils/alertas.js";
import { validarCaracteresProhibidos, validarSelectRequerido, mostrarErrores, validarRequerido, validarLongitud, limpiarErrores, validarSoloNumeros } from "../../utils/validaciones.js";

// ====================================================================
// Variables ocupadas para el funcionamiento de merma-productos
// ====================================================================
let productosDisponibles = [
];

const opcionesFecha = {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};

// ====================================================================
// Funciones para realizar validaciones del lado del Cliente
// ====================================================================
const validacionesMermasProductos = {
    producto: (input) => {
        return validarSelectRequerido(input, 'producto');
    },
    motivo_merma: (input) => {
        return validarSelectRequerido(input, 'motivo de merma');
    },
    cantidad: (input) => {
        const requerido = validarRequerido(input, 'cantidad');
        if (requerido) return requerido;
        const soloNumeros = validarSoloNumeros(input, 'cantidad');
        if (soloNumeros) return soloNumeros;
        if (parseFloat(input) <= 0) {
            return 'La cantidad debe ser mayor a 0';
        }
        return null;
    },
    observaciones: (input) => {
        const caracteresProhibidos = validarCaracteresProhibidos(input, 'observaciones');
        if (caracteresProhibidos) return caracteresProhibidos;
        const longitud = validarLongitud(input, 0, 100);
        if (longitud) return longitud;
        return null;
    }
}

function validarFormularioMerma() {
    const merma = {
        producto: document.getElementById('cmb_producto').value,
        motivo_merma: document.getElementById('cmb_motivo_merma').value,
        cantidad: document.querySelector('input[name="cantidad"]').value,
        observaciones: document.querySelector('textarea[name="observaciones"]').value
    }

    const errores = {};

    Object.keys(validacionesMermasProductos).forEach(campo => {
        const error = validacionesMermasProductos[campo](merma[campo]);
        if (error) {
            errores[campo] = error;
        }
    });

    return Object.keys(errores).length === 0 ? null : errores;
}

// ====================================================================
// Funciones para manejar el DOM y mostrar modales y alertas
// ====================================================================
// Funcion generica para abrir un modal en base a la clase hidden
function abrirModal(tipo) {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');

    backdrop.classList.remove('hidden');
    document.getElementById('modalTitulo').textContent =
        tipo === 'editar' ? 'Editar merma de galleta' : 'Añadir merma de galleta';
    modalForm.classList.remove('hidden');
}

// Función para filtrar la tabla
function filtrarTabla() {
    const textoBusqueda = document.querySelector('input[name="buscar"]').value.toLowerCase();
    const filas = document.querySelectorAll('#tbody_merma_producto tr');
    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();

        if (textoFila.includes(textoBusqueda)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

// Funcino para cerrar los distintos modales
function cerrarModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
    limpiarFormulario();
}

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flask
// ====================================================================
// funcion para cargar los producto en la vista de mermas de producto
function consultarProductos() {
    return api.getJSON('/galletas/get_all_galletas')
        .then(data => {
            if (data) productosDisponibles = data;
            return data;
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar productos', 'error');
        });
}

function cargarSelectProductos() {
    const select = document.getElementById('cmb_producto');
    select.innerHTML = '<option value="">Seleccione un producto</option>';
    productosDisponibles.forEach(producto => {
        select.innerHTML += `
        <option value="${producto.id_galleta}" data-existencias="${producto.existencias}">
            ${producto.nombre_galleta}
        </option>
        `;
    });
}

// Funcion para actualizar el max del campo de la cantidad de merma de producto
// Funcion para actualizar el max del campo de la cantidad de merma de producto
function cambiarMaxSelectProducto() {
    const select = document.getElementById('cmb_producto');
    const inputCantidad = document.querySelector('input[name="cantidad"]');
    const opcionSeleccionada = select.options[select.selectedIndex];
    
    if (opcionSeleccionada.value) {
        inputCantidad.max = Number(opcionSeleccionada.dataset.existencias);
    }
}

// Funcion para validar la cantidad tecleada en el campo de cantidad
function validarCantidadInput(event) {
    const input = event.target;
    const maxPermitido = Number(input.max);
    let valorActual = Number(input.value);

    // Validar si es número válido
    if (isNaN(valorActual)) {
        input.value = '';
        return;
    }

    // Corregir si excede el máximo
    if (valorActual > maxPermitido) {
        input.value = maxPermitido;
    }
}

// Funcion para cargar las mermas de productos al iniciar la aplicacion
function cargarMermaProducto() {
    const tbody = document.getElementById('tbody_merma_producto');
    tabs.mostrarEsqueletoTabla(tbody, 5, 5);
    consultarProductos().then(() => {
        cargarSelectProductos();
    });
    
    api.getJSON('/mermas/get_all_mermas_galletas')
        .then(data => {
            tbody.innerHTML = '';
            data.forEach(merma_producto => {
                const fecha = new Date(merma_producto.fecha);
                tbody.innerHTML += `
                    <tr data-id="${merma_producto.id_merma}" class="hover:bg-gray-100">
                        <td class="p-3 text-center">${fecha.toLocaleString('es-ES', opcionesFecha)}</td>
                        <td class="p-3 text-center">${merma_producto.motivo_descripcion}</td>
                        <td class="p-3 text-center">${merma_producto.galleta_descripcion}</td>
                        <td class="p-3 text-center">${merma_producto.cantidad}</td>
                        <td class="p-3 flex justify-center">
                            <button onclick="buscarMermaProductoId(${merma_producto.id_merma})" class="align-middle cursor-pointer">
                                <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                            </button>
                            <button onclick="eliminarMermaProducto(${merma_producto.id_merma})" class="align-middle cursor-pointer">
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
            Swal.fire('Error', error.message || 'Error al cargar mermas de productos', 'error');
        })
        .finally(() => tabs.desbloquearTabs());
}

function guardarMermaProducto() {
    // Validar formulario
    const errores = validarFormularioMerma();
    if (errores) {
        mostrarErrores(errores);
        return;
    }

    const formdata = {
        galleta_id: parseInt(document.getElementById('cmb_producto').value),
        motivo: parseInt(document.getElementById('cmb_motivo_merma').value),
        cantidad: parseInt(document.querySelector('input[name="cantidad"]').value),
        observacion: document.querySelector('textarea[name="observaciones"]').value.trim()
    };

    // si es modificar
    const id_merma = parseInt(document.querySelector('input[name="merma_producto_id"]').value);
    const endpoint = id_merma != 0 ? '/mermas/update_merma' : '/mermas/create_merma';
    let payload = id_merma != 0 ? { ...formdata, id_merma } : formdata;

    tabs.mostrarLoader();
    api.postJSON(endpoint, payload)
        .then(data => {
            cerrarModal();
            if (data.status === 200 || data.status === 201) {
                alertas.procesoTerminadoExito();
                cargarMermaProducto();
            } else {
                alertas.procesoTerminadoSinExito();
            }
            limpiarFormulario();
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al guardar merma producto', 'error');
        })
        .finally(() => tabs.ocultarLoader());
}

function buscarMermaProductoId(id_merma) {
    tabs.mostrarLoader();
    api.postJSON('/mermas/get_merma_galleta', { id_merma })
        .then(data => {
            if (data.id_merma) {
                document.querySelector('input[name="merma_producto_id"]').value = data.id_merma;

                const insumo = document.getElementById('cmb_producto');
                insumo.value = data.galleta_id;
                const cmb_motivo_merma = document.getElementById('cmb_motivo_merma');
                cmb_motivo_merma.value = data.id_motivo_merma;

                document.querySelector('input[name="cantidad"]').value = data.cantidad;
                document.querySelector('textarea[name="observaciones"]').value = data.observacion;

                abrirModal('editar');
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar merma del producto', 'error');
        })
        .finally(() => tabs.ocultarLoader());
}

function limpiarFormulario() {
    document.querySelector('input[name="merma_producto_id"]').value = 0;

    const producto = document.getElementById('cmb_producto');
    producto.value = '';
    const cmb_motivo_merma = document.getElementById('cmb_motivo_merma');
    cmb_motivo_merma.value = '';

    const cantidad = document.querySelector('input[name="cantidad"]');
    cantidad.value = '';
    cantidad.max = Number(0);

    document.querySelector('textarea[name="observaciones"]').value = '';

    limpiarErrores();
}

function eliminarMermaProducto(id_merma) {
    alertas.confirmarEliminar()
    .then(resultado => {
        if(!resultado.isConfirmed) {
            return Promise.reject('cancelado')
        }
        tabs.mostrarLoader();
        return api.postJSON('/mermas/delete_merma', {id_merma : id_merma})
    })
    .then(data => {
        if (data.id_merma && data.status === 200) {
            tabs.ocultarLoader();
            alertas.procesoTerminadoExito();
            cargarMermaProducto();
            limpiarFormulario();
        } else {
            Swal.fire('Error', data.error || 'Error al eliminar merma del producto', 'error');
        }
    })
    .catch(error => {
        if (error !== 'cancelado') {
            console.error('Error:', error.message || error);
            Swal.fire('Error', error.message || 'Error al eliminar', 'error');
        }
    });
}

// Exponer la función globalmente para poder ser usada en html
window.cargarMermaProducto = cargarMermaProducto;
window.guardarMermaProducto = guardarMermaProducto;
window.buscarMermaProductoId = buscarMermaProductoId;
window.eliminarMermaProducto = eliminarMermaProducto;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.filtrarTabla = filtrarTabla;
window.cambiarMaxSelectProducto = cambiarMaxSelectProducto;
window.validarCantidadInput = validarCantidadInput;