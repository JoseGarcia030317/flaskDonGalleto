import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flask de galletas
// ====================================================================
async function inicializarModuloCorteCaja() {
    const cortePendiente = await revisarCorteCaja();
    if (cortePendiente) { // Si hay un corte de caja
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
        console.log('Respuesta de la API:', response);
        return response;
    } else { // No existe corte
        console.error('Error al revisar el corte de caja');
        return null;
    }
}

// FUncion para solicitar el corte de caja
async function solicitarCorteCaja() {
    const result = await alertas.corteCajaInicio();
    
    if (!result) return; // Prevenir undefined
    
    // Manejar cancelación
    if (result.isDismissed) {
        console.log('Operación cancelada por el usuario');
        return;
    }

    const montoInicial = result.value;

    if (montoInicial) {
        // Registrar el corte en el sistema
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
    alert('cargando corte de caja')
    tabs.desbloquearTabs();
}

function mostrarMensaje() {
    alert('mostrando mensaje');
}

// Funcion para guardar el corte de caja
async function confirmarCierre() {
    const totalReal = document.getElementById('total-real-input').value;
    
    if (!totalReal || isNaN(totalReal)) {
        await alertas.alertaRecetas('Debe ingresar un monto válido');
        return;
    }
    
    // Aquí tu lógica para cerrar el corte
}

// Calcular total en el corte de caja
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

// Toggle sections
function toggleSection(tipo) {
    const body = document.getElementById(`${tipo}-body`);
    body.classList.toggle('hidden');
}

// Control del modal
function mostrarModalCierre() {
    // Resetear valores al mostrar
    document.getElementById('total-real-input').value = '';
    document.getElementById('diferencia').textContent = '- $0.00';
    document.getElementById('modal-cierre').classList.remove('hidden');
}

function cerrarModalCierre() {
    document.getElementById('modal-cierre').classList.add('hidden');
}

window.inicializarModuloCorteCaja = inicializarModuloCorteCaja;
window.mostrarMensaje = mostrarMensaje;
window.solicitarCorteCaja = solicitarCorteCaja;
window.toggleSection = toggleSection;
window.mostrarModalCierre = mostrarModalCierre;
window.confirmarCierre = confirmarCierre;
window.calcularDiferencia = calcularDiferencia;
window.cerrarModalCierre = cerrarModalCierre;