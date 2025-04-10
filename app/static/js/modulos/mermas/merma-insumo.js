import { api } from "../../utils/api.js";
import { tabs } from "../../utils/tabs.js";
import { alertas } from "../../utils/alertas.js";
import { validarCaracteresProhibidos, validarNumeroDecimal, validarSelectRequerido, mostrarErrores, validarRequerido, validarLongitud, limpiarErrores } from "../../utils/validaciones.js";

// ====================================================================
// Variables ocupadas para el funcionamiento de merma-insumos
// ====================================================================
let insumosDisponibles = [];

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
const validacionesMermasInsumos = {
    insumo: (input) => {
        return validarSelectRequerido(input, 'insumo');
    },
    motivo_merma: (input) => {
        return validarSelectRequerido(input, 'motivo de merma');
    },
    cantidad: (input) => {
        const requerido = validarRequerido(input, 'cantidad');
        if (requerido) return requerido;
        const soloNumeros = validarNumeroDecimal(input, 'cantidad');
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
        insumo: document.getElementById('cmb_insumo').value,
        motivo_merma: document.getElementById('cmb_motivo_merma').value,
        cantidad: document.querySelector('input[name="cantidad"]').value,
        observaciones: document.querySelector('textarea[name="observaciones"]').value
    }

    const errores = {};

    Object.keys(validacionesMermasInsumos).forEach(campo => {
        const error = validacionesMermasInsumos[campo](merma[campo]);
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

    document.getElementById('modalTitulo').textContent =
        tipo === 'editar' ? 'Editar merma de insumo' : 'Añadir merma de insumo';
    modalForm.classList.remove('hidden');
    backdrop.classList.remove('hidden');
}

// Función para filtrar la tabla
function filtrarTabla() {
    const textoBusqueda = document.querySelector('input[name="buscar"]').value.toLowerCase();
    const filas = document.querySelectorAll('#tbody_merma_insumo tr');
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
// Funciones para hacer las conexiones con la aplicaion Flak
// ====================================================================
// Funcion para cargar los insumos en la vista de mermas de insumos
function consultarInsumos() {
    return api.getJSON('/insumos/get_all_insumos_unidad')
        .then(data => {
            if (data) insumosDisponibles = data;
            return data;
        })
        .catch(error => {
            Swal.fire('Error', 'Error al cargar insumos', 'error');
        });
}

function cargarSelectInsumos() {
    const select = document.getElementById('cmb_insumo');
    select.innerHTML = '<option value="">Seleccione un insumo</option>';
    insumosDisponibles.forEach(insumo => {
        select.innerHTML += `
                    <option value="${insumo.id_insumo}" data-existencias="${insumo.existencias}">
                        ${insumo.nombre} (${insumo.simbolo})
                    </option>`;
    });
}

// Funcion para actualizar el max del campo de la cantidad de merma de producto
function cambiarMaxSelectProducto() {
    const select = document.getElementById('cmb_insumo');
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

// Funcion para cargar las mermas de insumos al iniciar la aplicacion
function cargarMermaInsumo() {
    const tbody = document.getElementById('tbody_merma_insumo');
    tabs.mostrarEsqueletoTabla(tbody,5,5);
    consultarInsumos().then(() => {
        cargarSelectInsumos();
    });

    api.getJSON('/mermas/get_all_mermas_insumos')
        .then(data => {
            tbody.innerHTML = '';
            data.forEach(merma_insumo => {
                const fecha = new Date(merma_insumo.fecha);
                tbody.innerHTML += `
                    <tr data-id="${merma_insumo.id_merma}" class="hover:bg-gray-100">
                        <td class="p-3 text-center">${fecha.toLocaleString('es-ES', opcionesFecha)}</td>
                        <td class="p-3 text-center">${merma_insumo.motivo_descripcion}</td>
                        <td class="p-3 text-center">${merma_insumo.insumo_descripcion}</td>
                        <td class="p-3 text-center">${merma_insumo.cantidad}</td>
                        <td class="p-3 flex justify-center">
                            <button onclick="buscarMermaInsumoId(${merma_insumo.id_merma})" class="align-middle cursor-pointer">
                                <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                            </button>
                            <button onclick="eliminarMermaInsumo(${merma_insumo.id_merma})" class="align-middle cursor-pointer">
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
            Swal.fire('Error', 'Error al cargar mermas de insumos', 'error');
        })
        .finally(() => tabs.desbloquearTabs());
}

function guardarMermaInsumo() {
    // Validar formulario
    const errores = validarFormularioMerma();
    if (errores) {
        mostrarErrores(errores);
        return;
    }

    const formData = {
        insumo_id: parseInt(document.getElementById('cmb_insumo').value),
        motivo: parseInt(document.getElementById('cmb_motivo_merma').value),
        cantidad: parseFloat(document.querySelector('input[name="cantidad"]').value),
        observacion: document.querySelector('textarea[name="observaciones"]').value
    }

    // si es modificar
    const id_merma = parseInt(document.querySelector('input[name="merma_insumo_id"]').value);
    const endpoint = id_merma != 0 ? '/mermas/update_merma' : '/mermas/create_merma';
    let payload = id_merma != 0 ? { ...formData, id_merma } : formData;

    tabs.mostrarLoader()
    api.postJSON(endpoint, payload)
        .then(data => {
            cerrarModal();
            if (data.status === 200 || data.status === 201) {
                alertas.procesoTerminadoExito();
                cargarMermaInsumo();
            } else {
                alertas.procesoTerminadoSinExito()
            }
            limpiarFormulario();
        })
        .catch(error => {
            Swal.fire('Error', 'Error al guardar merma insumo', 'error');
        })
        .finally(() => tabs.ocultarLoader());
}

function buscarMermaInsumoId(id_merma) {
    tabs.mostrarLoader();
    api.postJSON('/mermas/get_merma_insumo', { id_merma })
        .then(data => {
            if (data.id_merma) {
                document.querySelector('input[name="merma_insumo_id"]').value = data.id_merma;

                const insumo = document.getElementById('cmb_insumo');
                insumo.value = data.insumo_id;
                const cmb_motivo_merma = document.getElementById('cmb_motivo_merma');
                cmb_motivo_merma.value = data.id_motivo_merma;

                document.querySelector('input[name="cantidad"]').value = data.cantidad;
                document.querySelector('textarea[name="observaciones"]').value = data.observacion;

                abrirModal('editar');
            }
        })
        .catch(error => {
            Swal.fire('Error', 'Error al cargar merma del insumo', 'error');
        })
        .finally(() => tabs.ocultarLoader());
}

function eliminarMermaInsumo(id_merma) {
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
            cargarMermaInsumo();
            limpiarFormulario()
        } else {
            Swal.fire('Error', 'Error al eliminar merma del insumo', 'error');
        }
    })
    .catch(error => {
        if (error !== 'cancelado') {
            Swal.fire('Error', 'Error al eliminar', 'error');
        }
    })
    .finally(() => tabs.ocultarLoader());
}

function limpiarFormulario() {
    document.querySelector('input[name="merma_insumo_id"]').value = 0;

    const insumo = document.getElementById('cmb_insumo');
    insumo.value = '';
    const cmb_motivo_merma = document.getElementById('cmb_motivo_merma');
    cmb_motivo_merma.value = '';

    const cantidad = document.querySelector('input[name="cantidad"]');
    cantidad.value = '';
    cantidad.max = Number(0);
    
    document.querySelector('textarea[name="observaciones"]').value = '';

    limpiarErrores();
}

// Exponer la función globalmente para poder ser usada en html
window.cargarMermaInsumo = cargarMermaInsumo;
window.guardarMermaInsumo = guardarMermaInsumo;
window.eliminarMermaInsumo = eliminarMermaInsumo;
window.buscarMermaInsumoId = buscarMermaInsumoId;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.filtrarTabla = filtrarTabla;
window.cambiarMaxSelectProducto = cambiarMaxSelectProducto;
window.validarCantidadInput = validarCantidadInput;