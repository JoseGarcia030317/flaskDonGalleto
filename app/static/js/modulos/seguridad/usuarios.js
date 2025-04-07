import { api } from "../../utils/api.js";
import { tabs } from "../../utils/tabs.js";
import { alertas } from "../../utils/alertas.js";
import { validarCaracteresProhibidos, validarSelectRequerido, mostrarErrores, validarRequerido, validarLongitud, limpiarErrores, validarSoloNumeros, validarLetrasYNumeros, validarTelefono, validarSoloTexto, validarContrasena } from "../../utils/validaciones.js";

// ====================================================================
// Funciones para realizar validaciones del lado del Cliente
// ====================================================================

const validacionesUsuarios = {
    nombre : (input) => {
        const requerido = validarRequerido(input, 'nombre');
        if (requerido) return requerido;
        const caracteresProhibidos = validarCaracteresProhibidos(input, 'nombre');
        if (caracteresProhibidos) return caracteresProhibidos;
        const soloTexto = validarSoloTexto(input, 'nombre');
        if (soloTexto) return soloTexto;
        const longitud = validarLongitud(input, 3, 60);
        if (longitud) return longitud;
        return null;
    },
    app : (input) => {
        const requerido = validarRequerido(input, 'app');
        if (requerido) return requerido;
        const caracteresProhibidos = validarCaracteresProhibidos(input, 'app');
        if (caracteresProhibidos) return caracteresProhibidos;
        const soloTexto = validarSoloTexto(input, 'app');
        if (soloTexto) return soloTexto;
        const longitud = validarLongitud(input, 3, 60);
        if (longitud) return longitud;
        return null;
    },
    apm : (input) => {
        const requerido = validarRequerido(input, 'apm');
        if (requerido) return requerido;
        const caracteresProhibidos = validarCaracteresProhibidos(input, 'apm');
        if (caracteresProhibidos) return caracteresProhibidos;
        const soloTexto = validarSoloTexto(input, 'apm');
        if (soloTexto) return soloTexto;
        const longitud = validarLongitud(input, 3, 60);
        if (longitud) return longitud;
        return null;
    },
    telefono : (input) => {
        const requerido = validarSoloNumeros(input, 'telefono');
        if (requerido) return requerido;
        const telefono = validarTelefono(input);
        if (telefono) return telefono;
        return null;
    },
    tipoUsuario : (input) => {
        return validarSelectRequerido(input, 'tipoUsuario');
    },
    nombreUsuario : (input) => {
        const requerido = validarRequerido(input, 'nombreUsuario');
        if (requerido) return requerido;
        const LetrasYNumeros = validarLetrasYNumeros(input, 'nombreUsuario');
        if (LetrasYNumeros) return LetrasYNumeros;
        const longitud = validarLongitud(input, 3, 60);
        if (longitud) return longitud;
        return null;
    },
    contrasenia : (input) => {
        const requerido = validarRequerido(input, 'contrasenia');
        if (requerido) return requerido;
        const Contrasena = validarContrasena(input, 'contrasenia');
        if (Contrasena) return Contrasena;
        return null;
    }
}
// ====================================================================

function cargarUsuarios(){
    obtener_usuarios();
}

function obtener_usuarios() {
    const tbody = document.getElementById('tbody_usuario');
    tbody.innerHTML = ''; 
    cargarSelectRol();
    api.getJSON('/usuarios/get_user_all')
    .then(data => {
        if (data && Array.isArray(data)) {
            data.forEach(usuario => {
                const tr = document.createElement('tr');

                const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido_pat || ''} ${usuario.apellido_mat || ''}`.trim();

                tr.innerHTML = `
                    <td class="p-3 text-center">${nombreCompleto}</td>
                    <td class="p-3 text-center">${usuario.telefono}</td>
                    <td class="p-3 text-center">${usuario.tipo_usuario || ''}</td>
                    <td class="p-3 text-center">${usuario.usuario || ''}</td>
                    <td class="p-3 flex justify-center">
                        <button class="align-middle cursor-pointer" onclick="obtener_usuario_id(${usuario.id_usuario})">
                            <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                        </button>
                        <button class="align-middle cursor-pointer" onclick="eliminarUsuario(${usuario.id_usuario})">
                            <img src="../../../static/images/bote basura.png" class="w-7 h-7">
                        </button>
                    </td>
                `;

                tbody.appendChild(tr);
            });
        }  
    })
    .catch(error => {
        console.error('Error:', error.message);
        Swal.fire('Error', error.message || 'Error al cargar los usuarios', 'error');
    });
}



function eliminarUsuario(id_usuario) {
    alertas.confirmarEliminar()
    .then(resultado => {
        if (!resultado.isConfirmed) {
            return Promise.reject('cancelado');
        }
        return api.postJSON('/usuarios/delete_user', {id_usuario : id_usuario});
    })
    .then(data => {
        if (data.id_usuario) {
            alertas.procesoTerminadoExito();
            cargarUsuarios();
        } else {
            Swal.fire('Error', data.error || 'Error al eliminar usuario', 'error');
        }
    })
    .catch(error => {
        if (error !== 'cancelado') {
            console.error('Error:', error.message || error);
            Swal.fire('Error', error.message || 'Error al eliminar', 'error');
        }
    });
};

function guardar_usuario(event){
    event.preventDefault(); 
    const errores = validarFormulario();
        if (errores) {
            mostrarErrores(errores);
            return;
        }

    const formData = {
        nombre : document.querySelector('input[name="nombre"]').value,
        apellido_pat : document.querySelector('input[name="app"]').value,
        apellido_mat : document.querySelector('input[name="apm"]').value,
        telefono : document.querySelector('input[name="telefono"]').value,
        tipo : document.getElementById('tipoUsuario').value,
        usuario : document.querySelector('input[name="nombreUsuario"]').value,
        contrasenia : document.querySelector('input[name="contrasenia"]').value,
        estatus: 1
    }
        
    // Si es modificar
    const id_usuario = document.querySelector('input[name="id_usuario"]').value;
    let endpoint = id_usuario != 0 ? '/usuarios/update_user' : '/usuarios/create_user';
    let payload = id_usuario != 0 ? {...formData, id_usuario} : formData;
    
    api.postJSON(endpoint, payload)
        .then(data => {
            if (data.id_usuario) {
                cerrarModal();
                alertas.procesoTerminadoExito();
                cargarUsuarios();
                limpiarFormulario();
            } else {
                alert('Error al guardar el usuaro: ' + (data.error || 'Error desconocido'));
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al guardar usuaro', 'error');
        })
    
};

function obtener_usuario_id(id_usuario){
    api.postJSON('/usuarios/get_user_by_id', { usuario_id : id_usuario })
        .then(data => {
            if (data.id_usuario) {
                abrirModal('editar');
                llenarFormularioEdicion(data);
               
            } else {
                alert('Usuario no encontrado: ' + (data.error || 'Error desconocido'));
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al obtener usuario', 'error');
        });
}



// ====================================================================
// Funciones para manejar el DOM y mostrar modales y alertas
// ====================================================================
function abrirModal(tipo) {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');

    backdrop.classList.remove('hidden');
    document.getElementById('modalTitulo').textContent =
        tipo === 'editar' ? 'Editar Usuario' : 'Añadir Usuario';
    document.getElementById('tituloLabel').textContent = 
        tipo === 'editar' ? 'Contraseña Nueva:' : 'Contraseña:';
    modalForm.classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
    limpiarFormulario();
}

function filtrarTabla() {
    const textoBusqueda = document.querySelector('input[name="buscar"]').value.toLowerCase();
    const filas = document.querySelectorAll('#tbody_usuario tr');
    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();

        if (textoFila.includes(textoBusqueda)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
};

function cargarSelectRol() {
    const select = document.getElementById('tipoUsuario');

    api.getJSON('/usuarios/get_all_tipo_usuarios')
    .then(data => {
        select.innerHTML = '<option value="">Seleccione Rol Usuario</option>';
        data.forEach(tipo => {
            select.innerHTML += `
                    <option value="${tipo.id_tipo_usuario}">
                        ${tipo.nombre}
                    </option>`;
        });
    })
    .catch(error => {
        console.error('Error:', error.message);
        Swal.fire('Error', error.message || 'Error al cargar unidades', 'error');
    })
};


function cargarSelectRolEdicion(idSeleccionado) {
    const select = document.getElementById('tipoUsuario');
    select.innerHTML = '<option value="">Seleccione Rol Usuario</option>';

    api.getJSON('/usuarios/get_all_tipo_usuarios')
        .then(data => {
            data.forEach(tipo => {
                const selected = tipo.id_tipo_usuario === idSeleccionado ? 'selected' : '';
                select.innerHTML += `
                    <option value="${tipo.id_tipo_usuario}" ${selected}>
                        ${tipo.nombre}
                    </option>`;
            });
        })
        .catch(error => {
            console.error('Error:', error.message);
            Swal.fire('Error', error.message || 'Error al cargar roles de usuario', 'error');
        });
}



function llenarFormularioEdicion(data) {
    document.querySelector('#usuarioForm input[name="id_usuario"]').value = data.id_usuario || '';
    document.querySelector('#usuarioForm input[name="nombre"]').value = data.nombre || '';
    document.querySelector('#usuarioForm input[name="app"]').value = data.apellido_pat || '';
    document.querySelector('#usuarioForm input[name="apm"]').value = data.apellido_mat || '';
    document.querySelector('#usuarioForm input[name="telefono"]').value = data.telefono || '';
    document.querySelector('#usuarioForm input[name="nombreUsuario"]').value = data.usuario || '';
    document.querySelector('#usuarioForm input[name="contrasenia"]').value = ''
    cargarSelectRolEdicion(data.tipo); 
}

function validarFormulario() {
    const validacion = {
        nombre : document.querySelector('input[name="nombre"]').value,
        app : document.querySelector('input[name="app"]').value,
        apm : document.querySelector('input[name="apm"]').value,
        telefono : document.querySelector('input[name="telefono"]').value,
        tipoUsuario : document.getElementById('tipoUsuario').value,
        nombreUsuario : document.querySelector('input[name="nombreUsuario"]').value,
        contrasenia : document.querySelector('input[name="contrasenia"]').value
    }

    const errores = {};

    Object.keys(validacionesUsuarios).forEach(campo => {
        const error = validacionesUsuarios[campo](validacion[campo]);
        if (error) {
            errores[campo] = error;
        }
    });

    return Object.keys(errores).length === 0 ? null : errores;
};

function limpiarFormulario(){
    document.querySelector('input[name="id_usuario"]').value = 0;
    document.querySelector('input[name="nombre"]').value = '',
    document.querySelector('input[name="app"]').value = '',
    document.querySelector('input[name="apm"]').value = '',
    document.querySelector('input[name="telefono"]').value = '',
    document.querySelector('input[name="nombreUsuario"]').value = '',
    document.querySelector('input[name="contrasenia"]').value = '',
    cargarSelectRol();
    limpiarErrores();
}


window.cargarUsuarios = cargarUsuarios;
window.obtener_usuarios =  obtener_usuarios;
window.guardar_usuario = guardar_usuario;
window.eliminarUsuario = eliminarUsuario;
window.obtener_usuario_id = obtener_usuario_id;

window.filtrarTabla = filtrarTabla;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;