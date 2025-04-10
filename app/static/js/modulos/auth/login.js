
// FUNCION PARA EFECTO DEL LOGIN 

const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');


signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

async function successRegistro() {
   await Swal.fire({
        position: "center",
        icon: "success",
        title: "Registrado con éxito",
        text: "Ingrese su correo y contraseña para iniciar sesión",
        showConfirmButton: true,
        confirmButtonColor: '#5b3b33',
        timer: 6000
    });
}

async function errorRegistro() {
    await Swal.fire({
        icon: "error",
        title: "No se ha podido registrar",
        text: "Revise todos los campos!",
        showConfirmButton: false,
        timer: 4000
    });
}

// FUNCIÓN PARA VALIDAR EL FORMULARIO
function validarFormulario() {
    const cliente = {
        nombre: document.querySelector('input[name="nombre"]').value,
        apellido_pat: document.querySelector('input[name="apellido_pa"]').value, 
        apellido_mat: document.querySelector('input[name="apellido_mat"]').value,
        telefono: document.querySelector('input[name="telefono"]').value,
        correo: document.querySelector('input[name="correo"]').value,
        contrasenia: document.querySelector('input[name="contraseniaForm"]').value
    };

    const errores = {};

    // Validaciones 
    if (!cliente.nombre) errores.nombre = "El nombre es requerido";
    if (!cliente.apellido_pat) errores.apellido_pa = "El apellido paterno es requerido";
    if (!cliente.telefono || !/^\d{10}$/.test(cliente.telefono)) {
        errores.telefono = "El teléfono debe tener 10 dígitos";
    }
    if (!cliente.correo || !/^\S+@\S+\.\S+$/.test(cliente.correo)) {
        errores.correo = "Ingresa un correo válido";
    }
    if (!cliente.contrasenia || cliente.contrasenia.length < 8) {
        errores.contraseniaForm = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/[A-Z]/.test(cliente.contrasenia)) {
        errores.contraseniaForm = "La contraseña debe contener al menos una letra mayúscula";
    } else if (!/[a-z]/.test(cliente.contrasenia)) {
        errores.contraseniaForm = "La contraseña debe contener al menos una letra minúscula";
    } else if (!/\d/.test(cliente.contrasenia)) {
        errores.contraseniaForm = "La contraseña debe contener al menos un número";
    } else if (!/[@$!%*?&]/.test(cliente.contrasenia)) {
        errores.contraseniaForm = "La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &)";
    }

    return Object.keys(errores).length === 0 ? null : errores;
}

// FUNCIÓN PARA REGISTRAR USUARIO
async function registrarUsuario() {
    // Validar formulario 
    const errores = validarFormulario();
    if (errores) {
        mostrarErrores(errores);
        return;
    }

    const userData = {
        nombre: document.querySelector('input[name="nombre"]').value,
        apellido_pat: document.querySelector('input[name="apellido_pa"]').value,
        apellido_mat: document.querySelector('input[name="apellido_mat"]').value,
        telefono: document.querySelector('input[name="telefono"]').value,
        empresa: "", // Campo vacío este viene en empresa
        tipo: 1, // Valor por defecto Cliente = 1 Empresa = 2
        correo: document.querySelector('input[name="correo"]').value,
        contrasenia: document.querySelector('input[name="contraseniaForm"]').value,
        estatus: 1
    };

    try {
        const response = await fetch("/clientes/create_client", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al registrar usuario");
        }

        await successRegistro();
        // Redirigir o limpiar formulario
        window.location.href = "/login"; // RUTA A DONDE SERÁ REDIRIGIDO
    } catch (error) {
       await errorRegistro();
    }
}

function mostrarErrores(errores) {
    // Limpiar errores previos solo en el formulario de cliente
    document.querySelectorAll('.error-text').forEach(el => el.remove());

    // Mostrar nuevos errores en el formulario de cliente
    Object.entries(errores).forEach(([campo, mensaje]) => {
        const input = document.querySelector(`[name="${campo}"]`);
        if (input) {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-text';
            errorElement.style.color = 'red';
            errorElement.textContent = mensaje;
            input.insertAdjacentElement('afterend', errorElement);
        }
    });
}


// REGISTRAR UNA EMPRESA **************************************************************

// FUNCIÓN PARA VALIDAR EL FORMULARIO DE EMPRESA
function validarFormularioEmpresa() {
    const empresas = {
        empresa: document.querySelector('input[name="nombre_empresa"]').value,
        telefono: document.querySelector('input[name="telefono_empresa"]').value,
        correo: document.querySelector('input[name="correo_empresa"]').value,
        contrasenia: document.querySelector('input[name="contraseniaEmp"]').value
    };

    const erroresEmpresa = {};

    // Validaciones 
    if (!empresas.empresa) erroresEmpresa.nombre_empresa = "El nombre es requerido";
    if (!empresas.telefono || !/^\d{10}$/.test(empresas.telefono)) {
        erroresEmpresa.telefono_empresa = "El teléfono debe tener 10 dígitos";
    }
    if (!empresas.correo || !/^\S+@\S+\.\S+$/.test(empresas.correo)) {
        erroresEmpresa.correo_empresa = "Ingresa un correo válido";
    }
    if (!empresas.contrasenia || empresas.contrasenia.length < 8) {
        erroresEmpresa.contraseniaEmp = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/[A-Z]/.test(empresas.contrasenia)) {
        erroresEmpresa.contraseniaEmp = "La contraseña debe contener al menos una letra mayúscula";
    } else if (!/[a-z]/.test(empresas.contrasenia)) {
        erroresEmpresa.contraseniaEmp = "La contraseña debe contener al menos una letra minúscula";
    } else if (!/\d/.test(empresas.contrasenia)) {
        erroresEmpresa.contraseniaEmp = "La contraseña debe contener al menos un número";
    } else if (!/[@$!%*]/.test(empresas.contrasenia)) {
        erroresEmpresa.contraseniaEmp = "La contraseña debe contener al menos un carácter especial (@, $, !, %, *)";
    }

    return Object.keys(erroresEmpresa).length === 0 ? null : erroresEmpresa;
}

function mostrarErroresEmpresa(erroresEmpresa) {
    // Limpiar errores previos solo en el formulario de empresa
    document.querySelectorAll('.error-text').forEach(el => el.remove());

    // Mostrar nuevos errores
    Object.entries(erroresEmpresa).forEach(([campo, mensaje]) => {
        const input = document.querySelector(`input[name="${campo}"]`);
        if (input) {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-text';
            errorElement.style.color = 'red';
            errorElement.textContent = mensaje;
            input.insertAdjacentElement('afterend', errorElement);
        }
    });
}

// Evento de validación al enviar el formulario
document.getElementById("registerEmpresa").addEventListener("submit", function(event) {
    const errores = validarFormularioEmpresa();
    if (errores) {
        event.preventDefault(); // Evita el envío del formulario si hay errores
        mostrarErroresEmpresa(errores);
    }
});





// FUNCIÓN PARA REGISTRAR EMPRESA
async function registrarEmpresa() {
    // Validar formulario 
    const erroresEmpresa = validarFormularioEmpresa();
    if (erroresEmpresa) {
        mostrarErroresEmpresa(erroresEmpresa);
        return;
    }
    document.getElements

    const empresaData = {
        nombre: "",
        apellido_pat: "",
        apellido_mat: "",
        telefono: document.querySelector('input[name="telefono_empresa"]').value,
        empresa: document.querySelector('input[name="nombre_empresa"]').value,
        tipo: 2, // Valor por defecto Cliente = 1 Empresa = 2
        correo: document.querySelector('input[name="correo_empresa"]').value,
        contrasenia: document.querySelector('input[name="contraseniaEmp"]').value,
        estatus: 1
    };

    try {
        const response = await fetch("/clientes/create_client", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(empresaData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al registrar');
        }

        await  successRegistro();
        // Redirigir o limpiar formulario
        window.location.href = "/login"; // ruta a donde será redirigido
    } catch (error) {
        await errorRegistro();
    }
}





// OCULTAR LOGIN/REGISTRO CLIENTE 

function mostrarDiv2() {
    document.getElementById('div1').style.display = 'none';
    document.getElementById('div2').style.display = 'block';
  }
  
  function mostrarDiv1() {
    document.getElementById('div2').style.display = 'none';
    document.getElementById('div1').style.display = 'block';
  }


