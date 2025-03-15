// Llamar a cargarProveedores al cargar la página
document.addEventListener('DOMContentLoaded', cargarProveedores());

// ====================================================================
// Funciones para manejar el DOM y mostrar modales
// ====================================================================
// Funcion generica para abrir un modal en base a la clase hidden
function abrirModal(tipo) {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');
    const modalEliminar = document.getElementById('modalEliminar');
    const modalExito = document.getElementById('modalExito');

    backdrop.classList.remove('hidden');

    if (tipo === 'eliminar') {
        modalEliminar.classList.remove('hidden');
    } else if (tipo === 'exito') {
        modalExito.classList.remove('hidden')
    } else {
        modalForm.classList.remove('hidden');
        document.getElementById('modalTitulo').textContent =
            tipo === 'editar' ? 'Editar proveedor' : 'Añadir proveedor';
    }
}

// Cerrar modal al hacer clic fuera
document.getElementById('modalBackdrop').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalBackdrop')) {
        cerrarModal();
    }
});

// Funcino para cerrar los distintos modales
function cerrarModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
    document.getElementById('modalEliminar').classList.add('hidden');
    document.getElementById('modalExito').classList.add('hidden');
}

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flak
// ====================================================================
// Obtener CSRF Token del formulario
function getCSRFToken() {
    alert(document.querySelector('input[name="csrf_token"]').value)
    return document.querySelector('input[name="csrf_token"]').value;
}

// Funcion para cargar los proveedores al iniciar la aplicacion
function cargarProveedores() {
    fetch('/provedores/get_all_proveedores')
        .then(response => {
            if (!response.ok) throw new Error('Error en la red');
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('tbody_proveedores');
            tbody.innerHTML = '';

            data.forEach(proveedor => {
                tbody.innerHTML += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3 text-center">${proveedor.nombre}</td>
                    <td class="p-3 text-center">${proveedor.telefono}</td>
                    <td class="p-3 text-center">${proveedor.estatus == 1 ? 'Activo' : 'Inactivo'}</td>
                    <td class="p-3 flex justify-center">
                        <button onclick="editarProveedor(${proveedor.id_proveedor})" class="align-middle">
                            <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                        </button>
                        <button onclick="eliminarProveedor(${proveedor.id_proveedor})" class="align-middle">
                            <img src="../../../static/images/bote basura.png" class="w-7 h-7">
                        </button>
                    </td>
                </tr>
            `;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar proveedores');
        });
}

// Evento para interceptar el evento submit del formulario de registro y evitar que se ejecute y poder ejecutar el fetch
document.getElementById('proveedorForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = {
        nombre: document.querySelector('input[name="nombre"]').value,
        telefono: document.querySelector('input[name="telefono"]').value,
        contacto: document.querySelector('input[name="contacto"]').value,
        correo_electronico: document.querySelector('input[name="email"]').value,
        estatus: 1,
        descripcion_servicio: document.querySelector('textarea[name="descripcion"]').value
    };

    fetch('/provedores/create_proveedor', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log('Estado HTTP:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Respuesta del servidor:', data);
        if (data.success) {
            cerrarModal();
            abrirModal('exito');
            cargarProveedores();
        } else {
            alert('Error al crear proveedor: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error en la petición:', error);
        alert('Error al crear proveedor');
    });
});

// ====================================================================
// Funciones para realizar validaciones del lado del Cliente
// ====================================================================
function validarCampos(data) {
    // Implementar validaciones específicas
    return Object.values(data).every(value => value.trim() !== '');
}

function confirmarEliminar() {
    // Lógica para eliminar
    cerrarModal();
    abrirModal('exito');
}