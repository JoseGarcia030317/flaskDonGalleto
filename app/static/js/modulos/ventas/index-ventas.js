import { api } from "../../utils/api.js";
import { tabs } from "../../utils/tabs.js";
import { revisarCorteCaja } from "./corte-caja.js";

// Funcion para cargar la vista principal de compras en el main
function cargarModuloVentas() {
    const main_content = document.getElementById("main-content");
    main_content.innerHTML = tabs.mostrarEsqueletoModuloContent(main_content);
    api.getHTML("/ventas")
        .then(html => {
            main_content.innerHTML = html;
            document.getElementById("tabs-container").addEventListener("click", (e) => {
                const tab = e.target.closest(".tab-item");
                if (!tab) return;
                const endpoint = tab.dataset.target;
                cargarContenidoVentas(endpoint);
            });
            // No hay un corte de caja del día actual
            if (revisarCorteCaja() === null) {
                cargarContenidoVentas("corte-caja");
            } else {
                cargarContenidoVentas("solicitud-produccion");
            }
        })
        .catch(err => console.error("Error cargando el módulo de ventas: ", err));
}

// Función genérica para cargar cualquier sección de compras dinámicamente
function cargarContenidoVentas(endpoint) {
    const ventasContent = document.getElementById("ventas-contenido");
    tabs.bloquearTabs();
    ventasContent.innerHTML = tabs.mostrarEsqueletoModuloContent();
    tabs.cambiarTab(endpoint);
    const timestamp = Date.now();
    api.getHTML(`/ventas/${endpoint}?_=${timestamp}`)
        .then(html => {
            ventasContent.innerHTML = html;

            // Eliminar scripts antiguos
            document.querySelectorAll('script[data-submodule]').forEach(script => script.remove());

            // Cargar script del submódulo
            const script = document.createElement('script');
            script.src = `../../static/js/modulos/ventas/${endpoint}.js`;
            script.type = 'module';
            script.setAttribute('data-submodule', endpoint);

            script.onload = () => {
                console.log(`Script de ${endpoint} cargado`);
                // TO DO: aquí tienes que colocar los if's necesarios para poder inicializar cada uno de los submodulos
                // Ejemplo:
                if (endpoint === 'registro-ventas') window.cargarRegistroVentas();
                if (endpoint === 'listado-ventas') window.inicializarModuloListadoVentas();
                if (endpoint === 'listado-pedidos') window.inicializarModuloListadoPedidos();
                if (endpoint === 'corte-caja') window.inicializarModuloCorteCaja();
                if (endpoint === 'solicitud-produccion') window.inicializarModuloSolicitudProduccion();
            };

            document.body.appendChild(script);
        })
        .catch(err => console.error(`Error cargando ${endpoint}:`, err));
}

// Asignar la función globalmente para que sea accesible en el HTML
window.cargarModuloVentas = cargarModuloVentas;