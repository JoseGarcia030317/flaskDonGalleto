import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';

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
// Funciones para manejar el DOM y mostrar modales
// ====================================================================
function abrirModal() {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');

    backdrop.classList.remove('hidden');
    modalForm.classList.remove('hidden')
}

// Funcino para cerrar los distintos modales
function cerrarModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
    document.getElementById('btn-cancelar').disabled = false;
}

// Función para filtrar la tabla
function filtrarTabla() {
    const textoBusqueda = document.querySelector('input[name="buscar"]').value.toLowerCase();
    const filas = document.querySelectorAll('#tbody_listado_pedidos tr');
    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();

        if (textoFila.includes(textoBusqueda)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

function inicializarModuloListadoVentas() {
    cargarTablaVentas();
}

function cargarTablaVentas() {
    const tbody = document.getElementById("tbody_listado_ventas");
    tabs.mostrarEsqueletoTabla(tbody, 5, 6);
    api.getJSON('/ventas/get_all_ventas')
        .then(data => {
            tbody.innerHTML = '';
            data.forEach(venta => {
                const fecha = new Date(venta.fecha);
                tbody.innerHTML += `
                <tr data-id="${venta.id_venta}" class="hover:bg-gray-100">
                    <td class="p-3 text-center">${fecha.toLocaleString('es-ES', opcionesFecha)}</td>    
                    <td class="p-3 text-center">${venta.clave_venta}</td>
                    <td class="p-3 text-center">${venta.observacion}</td>
                    <td class="p-3 text-center">${venta.descuento || 0}</td>
                    <td class="p-3 text-center">${ ((venta.estatus || 0) === 1) ? 'Activa' : 'Cancelada' }</td>
                    <td class="p-3 flex justify-center">
                        <button onclick="buscarVentaPorId(${venta.id_venta})" class="align-middle cursor-pointer">
                            <img src="../../../static/images/info.png" class="w-7 h-7">
                        </button>
                    </td>
                </tr>
            `;
            });
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar el historial de ventas', 'error');
        })
        .finally(() => tabs.desbloquearTabs());
}

// Buscar un venta por su id
function buscarVentaPorId(id) {
    tabs.mostrarLoader();
    api.postJSON('/ventas/get_venta_by_id', { id_venta: id })
        .then(data => {
            if (data.id_venta) {
                cargarVentaEnModal(data)
                abrirModal()
            } else {
                alertas.mostrarError('venta no encontrada')
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar el la venta', 'error');
        })
        .finally(() => tabs.ocultarLoader());
}

function cargarVentaEnModal(venta) {
    document.querySelector("input[name='venta_id']").value = venta.id_venta;
    document.querySelector("label[name='clave']").innerHTML = venta.clave_venta;
    document.querySelector("label[name='fecha']").innerHTML = venta.fecha;
    document.querySelector("label[name='descuento']").innerHTML = venta.descuento || 0;
    document.querySelector("label[name='observaciones']").innerHTML = venta.observacion;
    document.querySelector("label[name='total']").innerHTML = "$" + (venta.total_venta).toFixed(2);

    const tbodyDetalles = document.querySelector("#tbody_venta_detalle");
    tbodyDetalles.innerHTML = '';
    venta.detalle_venta.forEach(detalle => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="p-3 text-center">${detalle.galleta_nombre}</td>
            <td class="p-3 text-center">${detalle.tipo_venta || 'Sin tipo de venta'}</td>
            <td class="p-3 text-center">${detalle.precio_unitario}</td>
            <td class="p-3 text-center">${detalle.factor_venta}</td>
            <td class="p-3 text-center">$${(detalle.subtotal).toFixed(2)}</td>
        `;
        tbodyDetalles.appendChild(fila);
    });
    if (venta.estatus === 0) document.getElementById('btn-cancelar').disabled = true;
}

function cancelarVenta() {
    alertas.confirmarEliminar()
        .then(resultado => {
            if (!resultado.isConfirmed) {
                return Promise.reject('cancelado');
            }
            tabs.mostrarLoader();
            let id_venta = parseInt(document.querySelector('input[name="venta_id"]').value);
            return api.postJSON('/ventas/cancelar_venta', {id_venta : id_venta})
        })
        .then(data => {
            if (data.message === "Venta cancelada correctamente") {
                tabs.ocultarLoader();
                alertas.procesoTerminadoExito();
                cargarTablaVentas();
            } else {
                Swal.fire('Error', data.error || 'Error al eliminar la venta', 'error');
            }
        })
        .catch(error => {
            if (error !== 'cancelado') {
                console.error('Error:', error.message || error);
                Swal.fire('Error', error.message || 'Error al eliminar la venta', 'error');
            }
        });
}

function generarPdfTicket() {
    alert('Generando PDF...');
}

window.inicializarModuloListadoVentas = inicializarModuloListadoVentas;
window.filtrarTabla = filtrarTabla;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.buscarVentaPorId = buscarVentaPorId;
window.cancelarVenta = cancelarVenta;
window.generarPdfTicket = generarPdfTicket;