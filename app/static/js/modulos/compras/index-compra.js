// Importar la utilidad api
import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';

// Funcion para cargar la vista principal de compras en el main
function cargarModuloCompras() {
    const main_content = document.getElementById("main-content");
    main_content.innerHTML = tabs.mostrarEsqueletoMainContent();

    api.getHTML('/compras')
    .then(html => {
        main_content.innerHTML = html;
        document.getElementById("tabs-container").addEventListener("click", (e) => {
            const tab = e.target.closest(".tab-item");
            if (!tab) return;
            const endpoint = tab.dataset.target;
            cargarContenidoCompras(endpoint);
        });
        // Carga el contenido inicial
        cargarContenidoCompras("proveedores");
    })
    .catch(error => {
        console.error("Error cargando el módulo de compras: ", error);
        Swal.fire('Error', 'No se pudo cargar el módulo de compras', 'error');
    });
}

// Función genérica para cargar cualquier sección de compras dinámicamente
function cargarContenidoCompras(endpoint) {
    const comprasContent = document.getElementById("compras-contenido");
    tabs.bloquearTabs();
    comprasContent.innerHTML = tabs.mostrarEsqueletoModuloContent();
    tabs.cambiarTab(endpoint);
    const timestamp = Date.now();
    api.getHTML(`/compras/${endpoint}?_=${timestamp}`)
    .then(html => {
        comprasContent.innerHTML = html;
        // Eliminar scripts antiguos
        document.querySelectorAll('script[data-submodule]').forEach(script => script.remove());

        // Cargar script del submódulo (también sin timestamp)
        const script = document.createElement('script');
        script.src = `../../static/js/modulos/compras/${endpoint}.js?_=${timestamp}`;
        script.type = 'module';
        script.setAttribute('data-submodule', endpoint);

        script.onload = () => {
            console.log(`Script de ${endpoint} cargado`);
            if (endpoint === 'proveedores') window.cargarProveedores();
            if (endpoint === 'insumos') window.cargarInsumos();
            if (endpoint === 'compras') window.initCompras();
            if (endpoint === 'almacen') window.cargarAlmacen();
        };

        document.body.appendChild(script);
    })
    .catch(err => {
        console.error(`Error cargando ${endpoint}:`, err);
        Swal.fire('Error', `No se pudo cargar la sección ${endpoint}`, 'error');
    });
}

// Asignar la función globalmente para que sea accesible en el HTML
window.cargarModuloCompras = cargarModuloCompras;