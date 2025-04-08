import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';

let ventasDisponibles = [];
let ventaSeleccionada = [];
const opcionesFecha = {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};

const ventas = [
    {
        id: 1,
        codigo: "VENTA-2023-001",
        fecha: "2023-10-01 09:30:00",
        descripcion: "Venta al por mayor a cliente frecuente",
        estado: 1,
        descuento: 0.00,
        detalles: [
            {
                detalle_id: 1,
                producto_id: 1,
                cantidad: 1221.00,
                precio_unitario: 12123.00,
            }
        ]
    },
    {
        id: 2,
        codigo: "VENTA-2023-002",
        fecha: "2023-10-05 14:15:00",
        descripcion: "Venta minorista en tienda",
        estado: 1,
        descuento: 0.00,
        detalles: [
            {
                detalle_id: 2,
                producto_id: 2,
                cantidad: 1221.00,
                precio_unitario: 12123.00
            }
        ]
    },
    {
        id: 3,
        codigo: "VENTA-2023-003",
        fecha: "2023-10-10 11:00:00",
        descripcion: "Venta online con envío gratis",
        estado: 1,
        descuento: 0.00,
        detalles: [
            {
                detalle_id: 3,
                producto_id: 3,
                cantidad: 1221.00,
                precio_unitario: 12123.00
            }
        ]
    },
    {
        id: 4,
        codigo: "VENTA-2023-004",
        fecha: "2025-04-01 00:00:00",
        descripcion: "Venta corporativa con descuento especial",
        estado: 1,
        descuento: 0.00,
        detalles: [
            {
                detalle_id: 4,
                producto_id: 4,
                cantidad: 1221.00,
                precio_unitario: 12123.00
            },
            {
                detalle_id: 5,
                producto_id: 4,
                cantidad: 1221.00,
                precio_unitario: 12123.00,
                subtotal: 1221.00 * 12123.00
            }
        ]
    },
    {
        id: 5,
        codigo: "VENTA-2023-005",
        fecha: "2025-04-01 00:00:00",
        descripcion: "Promoción de temporada",
        estado: 1,
        descuento: 0.00,
        detalles: []
    }
];

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

function inicializarModuloListadoVentas() {
    cargarTablaVentas();
}

function cargarTablaVentas() {
    const tbody = document.getElementById("tbody_listado_ventas");
    tabs.mostrarEsqueletoTabla(tbody,5,5);
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
    api.postJSON('/ventas/get_venta_by_id', {id_venta : id})
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
    document.querySelector("label[name='total']").innerHTML = "$" + venta.detalle_venta.reduce((total, detalle) => total + (detalle.cantidad * detalle.precio_unitario), 0).toFixed(2);

    const tbodyDetalles = document.querySelector("#tbody_venta_detalle");
    tbodyDetalles.innerHTML = '';
    venta.detalles.forEach(detalle => {
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

function cancelarVenta() {
    alert('cancelando venta...');
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