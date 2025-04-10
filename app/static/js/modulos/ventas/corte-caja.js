import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';

const opcionesFecha = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
};

const opcionesHora = {
    hour: '2-digit',
    minute: '2-digit'
};

let monto_inicial = 0;
let ventas_efectivo = 0;
let egresos = 0;
let id_corte;
// ========================================================================
// Funciones para hacer las conexiones con la aplicaion Flask de corte de caja
// =========================================================================
// FUncion para inicializar el modulo y primero revisar si hay un corte de caja del dia
async function inicializarModuloCorteCaja() {
    id_corte = 0;
    const corteVigente = await revisarCorteCaja();
        if (corteVigente && corteVigente != 'undefined') { // Si hay un corte de caja
        id_corte = corteVigente.id_corte;
        document.getElementById('corte-caja-content').hidden = false;
        document.getElementById('fecha-hora').innerHTML = corteVigente.fecha_inicio;
        document.getElementById('usuario').innerHTML = corteVigente.nombre_usuario_inicio;
        monto_inicial = corteVigente.saldo_inicial;
        document.getElementById('monto-inicial').innerHTML = '$' + monto_inicial;
        cargarCorteCaja();
    } else { // No existe y hay que pedir crearlo
        document.getElementById('corte-caja-content').hidden = true;
        // pedir corte de caja
        solicitarCorteCaja();
    }
}

// Funcion que verifica si en BD hay un corte de caja con la fecha de hoy
export async function revisarCorteCaja() {
    const response = await api.getJSON('corte_caja/get_all_corte_caja');
    if (response) { // Sí existe el corte, lo regresa
        return response.find(corte => corte.estatus === 1);
    } else { // No existe corte
        console.error('Error al revisar el corte de caja');
        return null;
    }
}

// FUncion para solicitar el corte de caja
async function solicitarCorteCaja() {
    const result = await alertas.corteCajaInicio();
    
    if (!result) return;

    if (result.isDismissed) {
        console.log('Operación cancelada por el usuario');
        return;
    }
    const montoInicial = result.value;
    if (montoInicial) {
        registrarCorteCaja(montoInicial);
        inicializarModuloCorteCaja();
    }
}

// Funcion par registrar el corte de caja en BD
async function registrarCorteCaja(monto) {
    try {
        const response = await api.postJSON('/corte_caja/iniciar_caja', {
            saldo_inicial: parseFloat(monto),
            fecha: new Date().toISOString()
        });
        return response.success;
    } catch (error) {
        console.error('Error al registrar corte:', error);
        await alertas.alertaRecetas('Error al registrar el corte de caja');
        return false;
    }
}

// Funcion para cargar corte de caja en el vista
function cargarCorteCaja() {
    // cargar las ventas
    cargarVentas();
    // cargar las compras
    consultarCompras();
}

// Funccion para consultar las compras
function consultarCompras() {
    tabs.mostrarLoader();
    api.postJSON('/compras/list_compras_by_estatus', {
        estatus: [0,1,2],
        filtrar_por_fecha: "True"
    })
    .then(data => {
        if (data) {
            actualizarCardCompras(data);
        }
    })
    .catch(error => {
        alertas.alertaRecetas('Error al cargar las compras');
    })
    .finally(() => {
        tabs.ocultarLoader();
        tabs.desbloquearTabs();
    });
}

function cargarVentas() {
    tabs.mostrarLoader();
    api.getJSON('/ventas/get_venta_by_status')
    .then(data => {
        if (data) {
            actualizarCardVentas(data);
        }
    })
    .catch(error => {
        alertas.alertaRecetas('Error al cargar las ventas');
    })
    .finally(() => {
        tabs.ocultarLoader();
        tabs.desbloquearTabs();
    });
}

// Función auxiliar para formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

// Función para actualizar la card con los datos
function actualizarCardCompras(compras) {
    const comprasActivas = compras.filter(c => c.estatus === 1 || c.estatus === 2);
    const comprasCanceladas = compras.filter(c => c.estatus === 0);
    
    const totalActivas = comprasActivas.reduce((sum, compra) => sum + compra.total_compra, 0);
    const totalCanceladas = comprasCanceladas.reduce((sum, compra) => sum + compra.total_compra, 0);
    
    egresos = totalActivas;
    document.getElementById('label-total-compras').textContent = 
        formatCurrency(egresos);
    document.getElementById('label-cantidad-compras').textContent = 
        comprasActivas.length;
    document.getElementById('label-total-canceladas').textContent = 
        formatCurrency(totalCanceladas);
    document.getElementById('label-cantidad-canceladas').textContent = 
        comprasCanceladas.length;

    const comprasBody = document.getElementById('compras-body');
    
    while (comprasBody.children.length > 1) {
        comprasBody.removeChild(comprasBody.lastChild);
    }

    comprasActivas.forEach(compra => {
        agregarFilaCompra(comprasBody, compra, opcionesFecha, false);
    });

    comprasCanceladas.forEach(compra => {
        agregarFilaCompra(comprasBody, compra, opcionesFecha, true);
    });
}

function actualizarCardVentas(ventas) {
    const ventasActivas = ventas.filter(c => c.estatus === 1);
    const ventasCanceladas = ventas.filter(c => c.estatus === 0);
    
    const totalActivas = ventasActivas.reduce((sum, venta) => sum + venta.total_venta, 0);
    const totalCanceladas = ventasCanceladas.reduce((sum, venta) => sum + venta.total_venta, 0);

    ventas_efectivo = totalActivas;
    document.getElementById('label-total-ventas').textContent = formatCurrency(ventas_efectivo);
    document.getElementById('label-total-ventas-canceladas').textContent = ventasCanceladas.length + " (" + formatCurrency(totalCanceladas) + ")";

    const ventasBody = document.getElementById('ventas-body');
    
    while (ventasBody.children.length > 1) {
        ventasBody.removeChild(ventasBody.lastChild);
    }

    ventasActivas.forEach(venta => {
        agregarFilaVenta(ventasBody, venta, opcionesHora, false);
    });

    ventasCanceladas.forEach(venta => {
        agregarFilaVenta(ventasBody, venta, opcionesHora, true);
    });
}

// Función auxiliar para agregar filas
function agregarFilaCompra(container, compra, opcionesFecha, esCancelada) {
    const fila = document.createElement('div');
    fila.className = 'grid grid-cols-4 gap-2 p-4 border-b';
    
    // Formatear solo la fecha (DD/MM/YYYY)
    const fecha = new Date(compra.fecha_compra).toLocaleDateString('es-ES', opcionesFecha);

    const colorTexto = esCancelada ? 'text-red-600' : 'text-[#3C1D0C]';
    
    fila.innerHTML = `
        <span class="${colorTexto}">${fecha}</span>
        <span class="${colorTexto}">${compra.clave_compra}</span>
        <span class="${colorTexto}">${compra.proveedor}</span>
        <span class="text-right ${colorTexto}">${formatCurrency(compra.total_compra)}</span>
    `;
    
    container.appendChild(fila);
}

function agregarFilaVenta(container, venta, opcionesHora, esCancelada) {
    const fila = document.createElement('div');
    fila.className = 'grid grid-cols-4 gap-2 p-4 border-b';
    
    // Formatear solo la fecha (DD/MM/YYYY)
    const fecha = new Date(venta.fecha).toLocaleTimeString('es-ES', opcionesHora);

    const colorTexto = esCancelada ? 'text-red-600' : 'text-[#3C1D0C]';
    
    fila.innerHTML = `
        <span class="${colorTexto}">${fecha}</span>
        <span class="${colorTexto}">${venta.clave_venta}</span>
        <span class="${colorTexto}">${venta.estatus === 1 ? 'Completada' : 'Cancelada'}</span>
        <span class="text-right ${colorTexto}">${formatCurrency(venta.total_venta)}</span>
    `;
    
    container.appendChild(fila);
}

// Funcion para guardar el corte de caja en bd
async function confirmarCierre() {
    const totalReal = document.getElementById('total-real-input').value;
    
    if (!totalReal || isNaN(totalReal)) {
        await alertas.alertaRecetas('Debe ingresar un monto válido');
        return;
    }
    tabs.mostrarLoader();
    api.postJSON('/corte_caja/cerrar_caja', {id_corte: id_corte, saldo_real: totalReal})
    .then(data => {
        if(data.estatus === 404){
            Swal.error('Error', data.message, 'error');
        } else {
            alertas.procesoTerminadoExito();
        }
    })
    .catch(error => {
        alertas.alertaRecetas('Error al guardar el corte de caja');
    })
    .finally(() => {
        tabs.ocultarLoader();
        tabs.desbloquearTabs();
    });
}

// Calcular total en el corte de caja en el modal
function calcularDiferencia() {
    // Obtener valores numéricos
    const totalReal = parseFloat(document.getElementById('total-real-input').value) || 0;
    const totalEsperado = document.getElementById('total_esperado').textContent;
    // Calcular diferencia
    const diferencia = totalReal - totalEsperado;
    
    // Formatear y mostrar
    const elementoDiferencia = document.getElementById('diferencia');
    elementoDiferencia.textContent = diferencia.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });
    
    // Cambiar color según resultado
    elementoDiferencia.classList.toggle('text-red-600', diferencia < 0);
    elementoDiferencia.classList.toggle('text-green-600', diferencia >= 0);
}

// Colapsar cards de las compras y ventas
function toggleSection(tipo) {
    const body = document.getElementById(`${tipo}-body`);
    body.classList.toggle('hidden');
}

// Funcion para mostrar el modal del corte de caja con los calculos
function mostrarModalCierre() {
    let total_esperado = monto_inicial + ventas_efectivo - egresos;
    let total_esperado_formato = Math.round(total_esperado * 100) / 100; // Devuelve un número
    document.getElementById('modal-cierre').classList.remove('hidden');
    document.getElementById('total-real-input').value = '';
    document.getElementById('monto_inicial').textContent = monto_inicial;
    document.getElementById('venta_efectivo').textContent = ventas_efectivo;
    document.getElementById('egresos').textContent = egresos;
    document.getElementById('total_esperado').textContent = total_esperado_formato;
    document.getElementById('diferencia').textContent = '- $0.00';
    
}

// Funcion para cerrar el modal del corte de caja
function cerrarModalCierre() {
    document.getElementById('modal-cierre').classList.add('hidden');
}

window.inicializarModuloCorteCaja = inicializarModuloCorteCaja;
window.solicitarCorteCaja = solicitarCorteCaja;
window.toggleSection = toggleSection;
window.mostrarModalCierre = mostrarModalCierre;
window.confirmarCierre = confirmarCierre;
window.calcularDiferencia = calcularDiferencia;
window.cerrarModalCierre = cerrarModalCierre;