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

const TIPOS_VENTA = {
    piezas: { id: 2, label: 'Por pieza', descuento: 0 },
    gramaje: { id: 1, label: 'Por gramaje', descuento: 0 },
    medio: { id: 3, label: 'Bolsa 700 g', descuento: 0.05 },
    kilo: { id: 4, label: 'Bolsa kilo', descuento: 0.10 }
};

let galletasDisponibles = [];
let pedidoActual = null;

// Obtener encontrar el tipo de venta desde tipo_venta_id
const VENTA_ID_TO_KEY = Object.entries(TIPOS_VENTA).reduce((map, [key, { id }]) => {
    map[id] = key;
    return map;
}, {});

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
    cargarGalletasDisponibles();
}

function cargarTablaPedidos() {
    const tbody = document.getElementById('tbody_listado_pedidos');
    tabs.mostrarEsqueletoTabla(tbody, 5, 5);
    return api.getJSON('/pedidos/get_all_pedidos')
        .then(data => {
            tbody.innerHTML = '';
            data.forEach(venta => {
                const fecha = new Date(venta.fecha);
                tbody.innerHTML += `
                    <tr data-id="${venta.id_pedido}" class="hover:bg-gray-100">
                    <td class="p-3 text-center">${fecha.toLocaleString('es-ES', opcionesFecha)}</td>
                    <td class="p-3 text-center">${venta.clave_pedido}</td>
                    <td class="p-3 text-center">${venta.nombre_cliente || '—'}</td>
                    <td class="p-3 text-center">${parseFloat(venta.total_pedido)}</td>
                    <td class="p-3 flex justify-center">
                        <button onclick="buscarPedidoPorId(${venta.id_pedido})" class="cursor-pointer">
                        <img src="../../../static/images/info.png" class="w-7 h-7">
                        </button>
                    </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', error.message || 'Error al cargar el listado de pedidos', 'error');
        })
        .finally(() => tabs.desbloquearTabs());
}

// Buscar un pedido por su id
function buscarPedidoPorId(id) {
    tabs.mostrarLoader();
    api.postJSON('/pedidos/get_pedidos_by_id', { id_pedido: id })
        .then(data => {
            if (data.id_pedido) {
                pedidoActual = data;
                cargarPedidoEnModal(data);
                abrirModal();
            } else {
                alertas.alertaWarning('Pedido no encontrado');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', error.message || 'Error al cargar el pedido', 'error');
        })
        .finally(() => tabs.ocultarLoader());
}

function cargarPedidoEnModal(pedido) {
    document.querySelector("input[name='pedido_id']").value = pedido.id_pedido;
    document.querySelector("label[name='clave']").textContent = pedido.clave_pedido;
    document.querySelector("label[name='fecha']").textContent = new Date(pedido.fecha).toLocaleString('es-ES', opcionesFecha);
    document.querySelector("label[name='cliente']").textContent = pedido.nombre_cliente || '';
    document.querySelector("label[name='total']").textContent = '$' + (pedido.total_pedido || 0).toFixed(2);

    const tbodyDetalles = document.getElementById('tbody_pedido_detalle');
    tbodyDetalles.innerHTML = '';
    pedido.detalles.forEach(det => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="p-3 text-center">${det.galleta_nombre}</td>
            <td class="p-3 text-center">${det.tipo_venta || '—'}</td>
            <td class="p-3 text-center">${det.precio_unitario.toFixed(2)}</td>
            <td class="p-3 text-center">${Number(det.factor_venta)}</td>
            <td class="p-3 text-center">$${(det.subtotal).toFixed(2)}</td>
        `;
        tbodyDetalles.appendChild(fila);
    });
}

function aceptarPedido() {
    alertas.confirmarPedido()
        .then(res => {
            if (!res.isConfirmed) return Promise.reject('cancelado');
            const convertido = validarYConvertirPedido(pedidoActual);
            if (!convertido) return Promise.reject('stock insuficiente');

            tabs.mostrarLoader();
            const id_venta = Number(document.querySelector("input[name='pedido_id']").value);
            return api.postJSON('/pedidos/aceptar_pedido', {
                id_venta,
                detalles: convertido
            });
        })
        .then(resp => {
            tabs.ocultarLoader();
            if (resp.status === 200 && resp.id_venta) {
                alertas.procesoTerminadoExito('Pedido aceptado');
                cargarTablaPedidos();
                cerrarModal();
            } else {
                Swal.fire('Error', resp.error || 'No se pudo aceptar el pedido', 'error');
            }
        })
        .catch(err => {
            tabs.ocultarLoader();
            if (err !== 'cancelado') console.error(err);
        });
}

function rechazarPedido() {
    alertas.rechazarPedido()
        .then(res => {
            if (!res.isConfirmed) return Promise.reject('cancelado');
            tabs.mostrarLoader();
            const id_venta = parseInt(document.querySelector("input[name='pedido_id']").value);
            return api.postJSON('/pedidos/cancelar_pedido', { id_pedido: id_venta });
        })
        .then(resp => {
            tabs.ocultarLoader();
            if (resp.status === 200 && resp.pedido.id_pedido) {
                alertas.procesoTerminadoExito();
            } else {
                alertas.alertaWarning('No se pudo rechazar el pedido')
            }
            cargarTablaPedidos();
            cerrarModal();
        })
        .catch(err => {
            tabs.ocultarLoader();
            if (err !== 'cancelado') console.error(err);
        });
}

// consultas las galletas disponibles
function cargarGalletasDisponibles() {
    return api.getJSON('/galletas/get_all_galletas')
        .then(data => {
            galletasDisponibles = data;
        })
        .catch(err => {
            console.error('Error al cargar galletas:', err);
            alertas.alertaError('No se pudo cargar el inventario de galletas');
        })
        .finally(() => tabs.desbloquearTabs());
}

// ====================================================================
// Funciones para las conversiones y calculos necesarios
// ====================================================================
// funcion para las validacion de existencias del pedido y convertirlo a piezas de galleta
function validarYConvertirPedido(pedido) {
    const detalleConvertido = [];

    for (const item of pedido.detalles) {
        const tipoKey = VENTA_ID_TO_KEY[item.tipo_venta_id];
        if (!tipoKey) {
            alertas.alertaWarning(`Tipo de venta desconocido (id=${item.tipo_venta_id})`);
            return false;
        }

        const galleta = galletasDisponibles.find(g => g.id_galleta === item.producto_id);
        if (!galleta) {
            alertas.alertaWarning(`Galleta no encontrada (id=${item.producto_id})`);
            return false;
        }

        const exist = Number(galleta.existencias);
        const gramos = Number(galleta.gramos_galleta);
        const piezas = calcCantidadGalletas(tipoKey, item.cantidad, gramos);

        if (piezas > exist) {
            alertas.alertaWarning(
                `Stock insuficiente para "${galleta.nombre_galleta}": ` +
                `pides ${piezas} piezas, pero solo hay ${exist}.`
            );
            return false;
        }

        detalleConvertido.push({
            galleta_id: item.producto_id,
            tipo_venta_id: item.tipo_venta_id,
            factor_venta: item.cantidad,
            cantidad_galletas: piezas,
            precio_unitario: item.precio_unitario
        });
    }

    return detalleConvertido;
}

// funcion para calcular la cantidad de galletas dependiendo del facto de venta, el tipo de venta
function calcCantidadGalletas(tipoKey, factor, gramosPorPieza) {
    let cantidad;
    switch (tipoKey) {
        case 'piezas':
            cantidad = factor;
            break;
        case 'gramaje':
            cantidad = factor / gramosPorPieza;
            break;
        case 'medio':
            cantidad = (factor * 700) / gramosPorPieza;
            break;
        case 'kilo':
            cantidad = (factor * 1000) / gramosPorPieza;
            break;
        default:
            cantidad = factor;
    }
    return Math.floor(cantidad);
}

window.inicializarModuloListadoPedidos = inicializarModuloListadoPedidos;
window.buscarPedidoPorId = buscarPedidoPorId;
window.filtrarTabla = filtrarTabla;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.aceptarPedido = aceptarPedido;
window.rechazarPedido = rechazarPedido;