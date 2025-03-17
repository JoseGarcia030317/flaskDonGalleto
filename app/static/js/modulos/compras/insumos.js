// Llamar a cargaInsumos el cargar la pagina
// document.addEventListener('DOMContentLoaded', cargarInsumos());

// Asignar evento al campo de busqueda
// document.querySelector('input[name="buscar"]').addEventListener('input', filtrarTabla());

// ====================================================================
// Funciones para manejar el DOM y mostrar modales
// ====================================================================
function abrirModal(tipo) {
    const backdrop = document.getElementById('modalBackdropInsumo');
    const modalForm = document.getElementById('modalFormInsumo');

    backdrop.classList.remove('hidden');

    if (tipo !== 'editar') {
        cargarSelectUnidad()
    }

    document.getElementById('modalTituloInsumo').textContent =
        tipo === 'editar' ? 'Editar insumo' : 'Añadir insumo';
    modalForm.classList.remove('hidden')
}

function confirmarEliminar() {
    return Swal.fire({
        title: "¿Estás seguro que deseas eliminar el registro?",
        imageUrl: "../../../static/images/warning.png",
        imageWidth: 128,
        imageHeight: 128,
        showCancelButton: true,
        confirmButtonText: '<span class="text-lg font-medium">Aceptar</span>',
        cancelButtonText: '<span class="text-lg font-medium">Cancelar</span>',
        customClass: {
            confirmButton: "flex items-center gap-3 px-6 py-3 border-2 border-[#8A5114] bg-white text-[#8A5114] rounded-full hover:bg-[#f5f5f5] transition-colors",
            cancelButton: "flex items-center gap-3 px-6 py-3 border-2 border-[#DAA520] bg-white text-[#DAA520] rounded-full hover:bg-[#f5f5f5] transition-colors"
        }
    });

}

function procesoTerminadoExito() {
    Swal.fire({
        position: "center",
        icon: "success",
        title: "Proceso realizado con exito",
        showConfirmButton: false,
        timer: 1500
    });
}

// Función para filtrar la tabla
function filtrarTabla() {
    const textoBusqueda = document.querySelector('input[name="buscar"]').value.toLowerCase();
    const filas = document.querySelectorAll('#tbody_insumos tr');
    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();

        if (textoFila.includes(textoBusqueda)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

// Cerrar modal al hacer clic fuera
// document.getElementById('modalBackdropInsumo').addEventListener('click', (e) => {
//     if (e.target === document.getElementById('modalBackdropInsumo')) {
//         cerrarModal();
//     }
// });

// Funcino para cerrar los distintos modales
function cerrarModal() {
    document.getElementById('modalBackdropInsumo').classList.add('hidden');
    document.getElementById('modalFormInsumo').classList.add('hidden');
    limpiarFormulario();
}

// ====================================================================
// Funciones para hacer las conexiones con la aplicaion Flak
// ====================================================================
// Obtener CSRF Token del formulario
function getCSRFToken() {
    alert(document.querySelector('input[name="csrf_token"]').value)
    return document.querySelector('input[name="csrf_token"]').value;
}

function cargarSelectUnidad() {
    const select = document.getElementById('cmb_unidad')

    fetch('/unidad/get_all_unidad')
        .then(response => {
            if (!response) throw new Error('Error al obtener los tipos de unidad');
            return response.json();
        })
        .then(data => {
            select.innerHTML = '';

            const optionDefault = document.createElement('option');
            optionDefault.value = '';
            optionDefault.textContent = 'Seleccione una unidad';
            select.appendChild(optionDefault);

            data.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.id_unidad;
                option.textContent = tipo.nombre + ' (' + tipo.simbolo + ')';
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar los tipos de unidad');
        });
}

function cargarInsumos() {
    fetch('/insumos/get_all_insumos_unidad')
        .then(response => {
            if (!response.ok) throw new Error('Error en la red');
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('tbody_insumos');
            tbody.innerHTML = '';

            data.forEach(insumo => {
                tbody.innerHTML += `
                <tr data-id="${insumo.id_insumo}" class="hover:bg-gray-50">
                    <td class="p-3 text-center">${insumo.nombre}</td>
                    <td class="p-3 text-center">${insumo.descripcion}</td>
                    <td class="p-3 text-center">${insumo.unidad.nombre + ' (' + insumo.unidad.simbolo + ')'}</td>
                    <td class="p-3 flex justify-center">
                        <button onclick="buscarInsumoId(${insumo.id_insumo})" class="align-middle">
                            <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                        </button>
                        <button onclick="eliminarInsumo(${insumo.id_insumo})" class="align-middle">
                            <img src="../../../static/images/bote basura.png" class="w-7 h-7">
                        </button>
                    </td>
                </tr>
            `;
            });
            limpiarFormulario();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar insumos');
        });
}

function guardarInsumo() {
    const formData = {
        nombre: document.querySelector('input[name="nombre"]').value,
        descripcion: document.querySelector('input[name="descripcion"]').value,
        unidad_id: parseInt(document.getElementById('cmb_unidad').value),
    };

    // Si es modificar
    const id_insumo = document.getElementById('insumo_id').value;
    let endpoint = '/insumos/create_insumo';

    if (id_insumo != 0) {
        endpoint = '/insumos/update_insumo';
        formData.id_insumo = id_insumo;
    }

    fetch(endpoint, {
        method: 'POST',
        // credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
            // 'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.id_insumo) {
                cerrarModal();
                procesoTerminadoExito();
                cargarInsumos();
                limpiarFormulario();
            } else {
                alert('Error al guardar el insumo: ' + (data.error || 'Error desconocido'));
            }
        })
        .catch(error => {
            console.error('Error en la petición:', error);
            alert('Error al guardar al insumo');
        });
}

async function eliminarInsumo(id_insumo) {
    const resultado = await confirmarEliminar();

    if (!resultado.isConfirmed) {
        return;
    }

    fetch('/insumos/delete_insumo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ id_insumo: id_insumo })
    })
        .then(response => {
            if (!response) throw new Error('Error en la red');
            return response.json();
        })
        .then(data => {
            if (data.id_insumo) {
                procesoTerminadoExito()
                cargarInsumos();
                limpiarFormulario();
            } else {
                alert('Error al eliminar insumo: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar el insumo');
        });
}

function buscarInsumoId(id_insumo) {
    fetch('/insumos/get_insumo_unidad_byId', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ id_insumo : id_insumo })
    })
        .then(response => {
            if (!response) throw new Error('Error al obtener los datos del insumo');
            return response.json();
        })
        .then(data => {
            if(data) {
                const select = document.getElementById('cmb_unidad');
                select.innerHTML = '';

                document.getElementById('insumo_id').value = data.id_insumo;
                document.querySelector('input[name="nombre"]').value = data.nombre;
                document.querySelector('input[name="descripcion"]').value = data.descripcion;

                const option = document.createElement('option');
                option.value = data.unidad.id_unidad;
                option.textContent = data.unidad.nombre + ' (' + data.unidad.simbolo + ')';
                select.appendChild(option);

                abrirModal('editar');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar los datos del insumo');
        });
}

function limpiarFormulario() {
    document.querySelector('input[name="nombre"]').value = '';
    document.querySelector('input[name="descripcion"]').value = '';

    cargarSelectUnidad();

    document.getElementById('insumo_id').value = 0;
}

// Exponer la función globalmente
window.cargarInsumos = cargarInsumos;