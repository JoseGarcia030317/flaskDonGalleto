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

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flak
// ====================================================================
// Funcion para carar el apartado de listado de pedidos
function inicializarModuloListadoPedidos() {
    cargarTablaPedidos();
}

function cargarTablaPedidos() {
    const tbody = document.getElementById("tbody_listado_pedidos");
    tabs.mostrarEsqueletoTabla(tbody, 5, 6);
    api.getJSON('/pedidos/get_all_pedidos')
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
                        <td class="p-3 text-center">${venta.cliente} || Chuchito</td>
                        <td class="p-3 flex justify-center">
                            <button onclick="buscarPedioPorId(${venta.id_venta})" class="align-middle cursor-pointer">
                                <img src="../../../static/images/info.png" class="w-7 h-7">
                            </button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar el listado de pedidos', 'error');
        })
        .finally(() => tabs.desbloquearTabs());
}

// Buscar un pedido por su id
function buscarPedidoPorId(id) {
    tabs.mostrarLoader();
    api.postJSON('/pedidos/get_pedido_by_id', { id_venta: id })
        .then(data => {
            if (data.id_venta) {
                cargarPedidoEnModal(data);
                abrirModal();
            } else {
                alertas.mostrarError('venta no encontrada');
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar la venta', 'error');
        })
}

function cargarPedidoEnModal(pedido) {
    document.querySelector("input[name='pedido_id']").value = pedido.id_venta;
    document.querySelector("label[name='clave']").innerHTML = pedido.clave_venta;
    document.querySelector("label[name='fecha']").innerHTML = pedido.fecha;
    document.querySelector("label[name='descuento']").innerHTML = pedido.descuento || 0;
    document.querySelector("label[name='observaciones']").innerHTML = pedido.observacion;
    document.querySelector("label[name='cliente']").innerHTML = pedido.cliente || 'Chuchito'
    document.querySelector("label[name='total']").innerHTML = "$" + (venta.total_venta).toFixed(2);

    const tbodyDetalles = document.querySelector("#tbody_pedido_detalle");
    tbodyDetalles.innerHTML = '';
    pedido.detalles.forEach(detalle => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="p-3 text-center">${detalle.producto_id}</td>
            <td class="p-3 text-center">${detalle.tipo_venta || 'Sin tipo de venta'}</td>
            <td class="p-3 text-center">${detalle.precio_unitario}</td>
            <td class="p-3 text-center">${detalle.cantidad}</td>
            <td class="p-3 text-center">$${(detalle.precio_unitario * detalle.cantidad).toFixed(2)}</td>
        `;
        tbodyDetalles.appendChild(fila);
    });
}

function aceptarPedido() {
    alertas.confirmarPedido()
        .then(resultado => {
            if (!resultado.isConfirmed) {
                return Promise.reject('cancelado')
            }
            tabs.mostrarLoader();
            const id_pedido = parseInt(document.querySelector("input[name='pedido_id']").value);
            return api.postJSON('/pedidos/aceptar_pedido', { id_venta: id_pedido });
        })
        .then(data => {
            if (data.id_venta && data.status === 200) {
                tabs.ocultarLoader();
                alertas.procesoTerminadoExito();
                cargarTablaPedidos();
            } else {
                Swal.fire('Error', data.error || 'Error al aceptar el pedido', 'error');
            }
        })
        .catch(error => {
            if (error !== 'cancelado') {
                console.error('Error:', error.message || error);
                Swal.fire('Error', error.message || 'Error al aceptar el pedido', 'error');
            }
        });
}

function rechazarPedido() {
    alertas.rechazarPedido()
        .then(resultado => {
            if (!resultado.isConfirmed) {
                return Promise.reject('cancelado');
            }
            tabs.mostrarLoader();
            let id_pedido = parseInt(document.querySelector("input[name='pedido_id']").value);
            return api.postJSON('/pedidos/rechazar_pedido', { id_pedido: id_pedido });
        })
        .then(data => {
            if (data.id_venta && data.status === 200) {
                tabs.ocultarLoader();
                alertas.procesoTerminadoExito();
                cargarTablaPedidos();
            } else {
                Swal.fire('Error', data.error || 'Error al rechazar el pedido', 'error');
            }
        })
        .catch(error => {
            if (error !== 'cancelado') {
                console.error('Error:', error.message || error);
                Swal.fire('Error', error.message || 'Error al rechazar el pedido', 'error');
            }
        });
}


window.inicializarModuloListadoPedidos = inicializarModuloListadoPedidos;
window.buscarPedidoPorId = buscarPedidoPorId;
window.filtrarTabla = filtrarTabla;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.aceptarPedido = aceptarPedido;
window.rechazarPedido = rechazarPedido;