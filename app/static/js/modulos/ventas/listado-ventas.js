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
    venta.detalle_venta.forEach(detalle => {
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
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("TICKET DE VENTA", 14, 10);

      doc.setFontSize(10);
      doc.text("Tienda: Don Galleto", 14, 20);
      doc.text("Dirección: Leon Gto.", 14, 25);
      doc.text("Tel: 123-456-7890", 14, 30);

      doc.text("---------------------------------", 14, 35);
      
      doc.setFontSize(12);
      doc.text("Producto", 14, 45);
      doc.text("Precio", 100, 45);
      doc.text("Cantidad", 140, 45);
      doc.text("Total", 180, 45);

      const productos = [
        { nombre: "Producto 1", precio: "$50.00", cantidad: 2, total: "$100.00" },
        { nombre: "Producto 2", precio: "$30.00", cantidad: 1, total: "$30.00" },
        { nombre: "Producto 3", precio: "$20.00", cantidad: 3, total: "$60.00" },
      ];

      let yPosition = 50;
      productos.forEach((producto) => {
        doc.text(producto.nombre, 14, yPosition);
        doc.text(producto.precio, 100, yPosition);
        doc.text(producto.cantidad.toString(), 140, yPosition);
        doc.text(producto.total, 180, yPosition);
        yPosition += 10;
      });

      doc.text("---------------------------------", 14, yPosition);
      yPosition += 5;

      doc.setFontSize(14);
      doc.text("Total a Pagar: $190.00", 14, yPosition);

      yPosition += 10;
      doc.text("¡Gracias por su compra!", 14, yPosition);


      doc.save("ticket_de_venta.pdf");
}

window.inicializarModuloListadoVentas = inicializarModuloListadoVentas;
window.filtrarTabla = filtrarTabla;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.buscarVentaPorId = buscarVentaPorId;
window.cancelarVenta = cancelarVenta;
window.generarPdfTicket = generarPdfTicket;