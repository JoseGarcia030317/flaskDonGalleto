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
        Swal.fire('Error', 'Error al cargar el historial de ventas', 'error');
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
        Swal.fire('Error', 'Error al cargar el la venta', 'error');
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

    const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const id_venta = document.querySelector('input[name="venta_id"]').value;

      api.postJSON('/ventas/get_venta_by_id', {id_venta : id_venta})
      .then(data => {
          if (data.id_venta) {
              const formatoMoneda = new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN'
              });

              doc.setFontSize(16);
              doc.text("TICKET DE VENTA", 14, 25);

              doc.setFontSize(10);
              doc.text("Clave de Venta: " + data.clave_venta, 14, 35);
              doc.text("Fecha: " + data.fecha, 14, 40);
              doc.text("Observaciones: " + (data.observacion || "Ninguna"), 14, 45);

              doc.text("---------------------------------", 14, 50);

              doc.setFontSize(12);
              doc.text("Producto", 14, 55);
              doc.text("Precio Unitario", 100, 55);
              doc.text("Cantidad", 140, 55);
              doc.text("Subtotal", 180, 55);

              let yPosition = 60;

              // Iterar sobre los productos en detalle_venta y agregarlos al ticket
              data.detalle_venta.forEach((producto) => {
                  doc.text(producto.galleta_nombre, 14, yPosition);
                  doc.text(formatoMoneda.format(producto.precio_unitario), 100, yPosition);
                  doc.text(producto.factor_venta.toString(), 140, yPosition);
                  doc.text(formatoMoneda.format(producto.subtotal), 180, yPosition);
                  yPosition += 10;
              });

              doc.text("---------------------------------", 14, yPosition);
              yPosition += 5;

              const totalBase = data.detalle_venta.reduce((total, producto) => total + producto.subtotal, 0);
              const valorDescuento = (totalBase * data.descuento) / 100;
              const totalConDescuento = totalBase - valorDescuento;
              const iva = totalConDescuento * 0.16;
              const totalPagar = totalConDescuento;

              const logoURL = '/static/images/LogoGalleto.png';
              doc.addImage(logoURL, 'PNG', 160, 5, 30, 30);

              doc.setFontSize(12);
              doc.text("Total Base", 14, yPosition);
              doc.text(formatoMoneda.format(totalBase), 180, yPosition);
              yPosition += 10;

              doc.text("Descuento (" + data.descuento + "%)", 14, yPosition);
              doc.text(formatoMoneda.format(valorDescuento), 180, yPosition);
              yPosition += 10;

              doc.text("---------------------------------", 14, yPosition);
              yPosition += 5;

              doc.text("IVA (16%)", 14, yPosition);
              doc.text(formatoMoneda.format(iva), 180, yPosition);
              yPosition += 10;

              doc.text("---------------------------------", 14, yPosition);
              yPosition += 5;

              doc.setFontSize(14);
              doc.text("Total a Pagar", 14, yPosition);
              doc.text(formatoMoneda.format(totalPagar), 180, yPosition);

              yPosition += 10;
              doc.text("¡Gracias por su compra!", 14, yPosition);

              doc.save("ticket_venta_" + data.clave_venta + ".pdf");
          } else {
              alertas.mostrarError('Venta no encontrada');
          }
      })
      .catch(error => {
          Swal.fire('Error', 'Error al imprimir ticket', 'error');
      })
      .finally(() => tabs.ocultarLoader());
}



window.inicializarModuloListadoVentas = inicializarModuloListadoVentas;
window.filtrarTabla = filtrarTabla;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.buscarVentaPorId = buscarVentaPorId;
window.cancelarVenta = cancelarVenta;
window.generarPdfTicket = generarPdfTicket;