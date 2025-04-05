import { api } from "../../utils/api.js";
import { tabs } from "../../utils/tabs.js";
import { alertas } from "../../utils/alertas.js";
import { validarCaracteresProhibidos, validarSelectRequerido, mostrarErrores, validarRequerido, validarLongitud, limpiarErrores, validarSoloNumeros, validarLetrasYNumeros } from "../../utils/validaciones.js";

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
    tbody.innerHTML = ''; // 👈 Limpia la tabla antes de volver a llenarla

    api.getJSON('/usuarios/get_user_all')
    .then(data => {
        if (data && Array.isArray(data)) {
            data.forEach(usuario => {
                const tr = document.createElement('tr');

                const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido_pat || ''} ${usuario.apellido_mat || ''}`.trim();

                tr.innerHTML = `
                    <td class="p-3 text-center">${nombreCompleto}</td>
                    <td class="p-3 text-center">${usuario.telefono}</td>
                    <td class="p-3 text-center">${usuario.tipo || ''}</td>
                    <td class="p-3 text-center">${usuario.usuario || ''}</td>
                    <td class="p-3 flex justify-center">
                        <button class="align-middle cursor-pointer" onclick="editarUsuario(${usuario.id_usuario})">
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
            cargarUsuarios(); // Aquí recargas la tabla completa
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
}


// ====================================================================
// Funciones para manejar el DOM y mostrar modales y alertas
// ====================================================================
function abrirModal(tipo) {
    const backdrop = document.getElementById('modalBackdropUsuarios');
    backdrop.classList.remove('hidden');
    let modalForm;  
    if (tipo === 'agregar') {
        modalForm = document.getElementById('modalFormA');
    } else {
        modalForm = document.getElementById('modalFormE');
    }
    modalForm.classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modalBackdropUsuarios').classList.add('hidden');
    document.getElementById('modalFormA').classList.add('hidden');
    document.getElementById('modalFormE').classList.add('hidden');
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


window.cargarUsuarios = cargarUsuarios;
window.obtener_usuarios =  obtener_usuarios;
window.eliminarUsuario = eliminarUsuario;

window.filtrarTabla = filtrarTabla;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;