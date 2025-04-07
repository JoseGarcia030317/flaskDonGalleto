import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';

const opcionesFecha = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
};

// ========================================================================
// Funciones para hacer las conexiones con la aplicaion Flask de corte de caja
// =========================================================================
// FUncion para inicializar el modulo y primero revisar si hay un corte de caja del dia
async function inicializarModuloCorteCaja() {
    const corteVigente = await revisarCorteCaja();
    if (corteVigente) { // Si hay un corte de caja
        document.getElementById('corte-caja-content').hidden = false;
        // mostramos el corte caja en la vista
        cargarCorteCaja();
    } else { // No existe y hay que pedir crearlo
        document.getElementById('corte-caja-content').hidden = true;
        // pedir corte de caja
        solicitarCorteCaja();
    }
}

// Funcion que verifica si en BD hay un corte de caja con la fecha de hoy
export async function revisarCorteCaja() {
    const response = await api.getJSON('/horneado/list_horneados');
    if (response) { // Sí existe el corte, lo regresa
        return response;
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
        const registroExitoso = await registrarCorteCaja(montoInicial);

        if (registroExitoso) {
            document.getElementById('corte-caja-content').hidden = false;
            alertas.alertaRecetas('Corte de caja registrado correctamente');
            cargarCorteCaja();
        }
    }
}

// Funcion par registrar el corte de caja en BD
async function registrarCorteCaja(monto) {
    try {
        const response = await api.postJSON('/corte_caja/registrar', {
            monto_inicial: parseFloat(monto),
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
    // cargarVentas();
    // cargar las compras
    consultarCompras();
}

// Funccion para consultar las compras
function consultarCompras() {
    tabs.mostrarLoader();
    api.postJSON('/compras/list_compras_by_estatus', {
        estatus: [0,1],
        filtrar_por_fecha: "True"
    })
    .then(data => {
        if (data) {
            actualizarCardCompras(data);
        }
    })
    .catch(error => {
        console.error('Error al obtener compras:', error);
        alertas.alertaRecetas('Error al cargar las compras');
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
    const comprasActivas = compras.filter(c => c.estatus === 1);
    const comprasCanceladas = compras.filter(c => c.estatus === 0);
    
    const totalActivas = comprasActivas.reduce((sum, compra) => sum + compra.total_compra, 0);
    const totalCanceladas = comprasCanceladas.reduce((sum, compra) => sum + compra.total_compra, 0);

    document.getElementById('label-total-compras').textContent = 
        formatCurrency(totalActivas);
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

// Funcion para guardar el corte de caja en bd
async function confirmarCierre() {
    const totalReal = document.getElementById('total-real-input').value;
    
    if (!totalReal || isNaN(totalReal)) {
        await alertas.alertaRecetas('Debe ingresar un monto válido');
        return;
    }
}

// Calcular total en el corte de caja en el modal
function calcularDiferencia() {
    // Obtener valores numéricos
    const totalEsperado = 2850.00; // Reemplazar con valor dinámico
    const totalReal = parseFloat(document.getElementById('total-real-input').value) || 0;
    
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
    document.getElementById('total-real-input').value = '';
    document.getElementById('diferencia').textContent = '- $0.00';
    document.getElementById('modal-cierre').classList.remove('hidden');
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