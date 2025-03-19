// Funcion para cargar la vista principal de dashboard en el main
function cargarModuloMermas() {
    const main_content = document.getElementById('main-content')
    main_content.innerHTML = '';
    fetch('/mermas')
    .then(response => response.text())
    .then(html => {
        main_content.innerHTML = html;

        document.getElementById('tabs-container').addEventListener('click', (e) => {
            const tab = e.target.closest('.tab-item');

            if(!tab) return;

            const endpoint = tab.dataset.target;
            cargarContenidoMermas(endpoint);
        });

        // Carga el contenido inicial
        cargarContenidoMermas("merma-producto");
    })
    .catch(err => console.error("Error cargando el módulo de mermas: ", err));
}

// Función genérica para cargar cualquier sección de compras dinámicamente
function cargarContenidoMermas(endpoint) {
    const mermasContent = document.getElementById('mermas-contenido');
    mermasContent.innerHTML = '';

    cambiarTab(endpoint);

    const timestamp = Date.now();
    fetch(`/mermas/${endpoint}?_=${timestamp}`)
    .then(response => response.text())
    .then(html => {
        mermasContent.innerHTML = html;

        // Eliminar scripts antiguos
        document.querySelectorAll('script[data-submodule]').forEach(script => script.remove());

        // Cargar script del submódulo
        const script = document.createElement('script');
        script.src = `../../static/js/modulos/mermas/${endpoint}.js?_=${timestamp}`;
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
window.cargarModuloMermas = cargarModuloMermas;