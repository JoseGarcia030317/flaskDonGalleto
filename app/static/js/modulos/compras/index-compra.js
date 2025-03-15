// Funcion para cargar la vista principal de compras en el main
// Configuración inicial al cargar el módulo
function cargarModuloCompras() {
    const main_content = document.getElementById("main-content");

    fetch("/compras")
        .then(response => response.text())
        .then(html => {
            main_content.innerHTML = html;
            // Carga el contenido inicial
            cargarContenidoCompras("proveedores");

            window.cargarProveedores = () => cargarContenidoCompras("proveedores");
            window.cargarInsumos = () => cargarContenidoCompras("insumos");
            window.cargarAlmacen = () => cargarContenidoCompras("almacen");
            window.cargarCompras = () => cargarContenidoCompras("compras");
        })
        .catch(err => console.error("Error cargando el módulo de compras: ", err));
}

// Función genérica para cargar cualquier sección de compras dinámicamente
function cargarContenidoCompras(endpoint) {
    const comprasContent = document.getElementById("compras-contenido");

    // Actualiza el tab visualmente
    cambiarTab(endpoint);

    fetch(`/compras/${endpoint}`)
        .then(response => response.text())
        .then(html => {
            comprasContent.innerHTML = html;

            // Cargar el JavaScript específico del submódulo
            const script = document.createElement('script');
            script.src = `../../static/js/modulos/compras/${endpoint}.js`;
            script.onload = () => {
                console.log(`Script de ${endpoint} cargado correctamente`);
            };
            script.onerror = () => {
                console.error(`Error al cargar el script de ${endpoint}`);
            };
            document.body.appendChild(script);
        })
        .catch(err => console.error(`Error cargando ${endpoint}:`, err));
}

// Funcion para cambiar tab seleccionado
function cambiarTab(tabId) {
    document.querySelectorAll('.tab-item').forEach(tab => {
        // Remover estilos activos
        tab.classList.remove(
            'active',
            'bg-[#8A5114]',
            'text-white'
        );

        // Aplicar estilos inactivos
        tab.classList.add(
            'text-black',
            'hover:bg-[#8A5114]/20'
        );
    });

    // Aplicar estilos al tab activo
    const activeTab = document.querySelector(`[data-target="${tabId}"]`);
    activeTab.classList.add(
        'bg-[#8A5114]',
        'text-white'
    );
    activeTab.classList.remove(
        'text-black',
        'hover:bg-[#8A5114]/20'
    );
}

// Asignar la función globalmente para que sea accesible en el HTML
window.cargarModuloCompras = cargarModuloCompras;