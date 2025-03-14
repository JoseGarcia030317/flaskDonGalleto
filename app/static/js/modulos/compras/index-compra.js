// Funcion para cargar la vista principal de compras en el main
// Configuración inicial al cargar el módulo
export function cargarModuloCompras() {
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
            'hover:bg-[#8A5114]/20' // Efecto hover para tabs inactivos
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