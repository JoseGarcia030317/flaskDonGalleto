import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flask de galletas
// ====================================================================
function inicializarModuloCorteCaja() {
    alertas.alertaRecetas('EN corte de caja');
}

window.inicializarModuloCorteCaja = inicializarModuloCorteCaja;