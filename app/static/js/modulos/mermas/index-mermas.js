import { api } from "../../utils/api.js";
import { tabs } from "../../utils/tabs.js";

// Funcion para cargar la vista principal de dashboard en el main
function cargarModuloMermas() {
    const main_content = document.getElementById('main-content')
    main_content.innerHTML = tabs.mostrarEsqueletoMainContent();
    
    api.getHTML('/mermas')
    .then(html => {
        main_content.innerHTML = html;
        document.getElementById('tabs-container').addEventListener('click', (e) => {
            const tab = e.target.closest('.tab-item');
            if(!tab) return;
            const endpoint = tab.dataset.target;
            cargarContenidoMermas(endpoint);
        });
        cargarContenidoMermas('merma-insumo')
    })
    .catch(error => {
        console.error("Error cargando el módulo de mermas: ", error);
        Swal.fire('Error', 'No se pudo cargar el módulo de mermas', 'error');
    });
}

// Función genérica para cargar cualquier sección de compras dinámicamente
function cargarContenidoMermas(endpoint) {
    const mermasContent = document.getElementById('mermas-contenido');
    tabs.bloquearTabs();
    mermasContent.innerHTML = tabs.mostrarEsqueletoModuloContent();
    tabs.cambiarTab(endpoint);
    const timestamp = Date.now();
    api.getHTML(`/mermas/${endpoint}?_=${timestamp}`)
    .then(html => {
        mermasContent.innerHTML = html;
        // Eliminar scripts antiguos
        document.querySelectorAll('script[data-submodule]').forEach(script => script.remove());

        // Cargar script del submódulo
        const script = document.createElement('script');
        script.src = `../../static/js/modulos/mermas/${endpoint}.js?_=${timestamp}`;
        script.type = 'module';
        script.setAttribute('data-submodule', endpoint);

        script.onload = () => {
            console.log(`Script de ${endpoint} cargado`);
            // TO DO: aquí tiene que colocar los if's necesarios para poder iniciarlizar cada uno de los submodulos
            // Ejemplo:
            // if (endpoint === 'merma-producto') window.cargarMermaProducto();
            // if (endpoint === 'merma-insumo') window.cargarMermaInsumo();
        };
        document.body.appendChild(script);
    })
    .catch(error => {
        console.error(`Error cargando ${endpoint}:`, error);
        Swal.fire('Error', `No se pudo cargar la sección ${endpoint}`, 'error');
    });
}

// Asignar la función globalmente para que sea accesible en el HTML
window.cargarModuloMermas = cargarModuloMermas;