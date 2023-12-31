let datos = {
  nombreCompleto: undefined,
  dni: undefined,
  nombreEmpresa: undefined,
  cuit: undefined,
  tipoDeUsario: undefined,
};

let estoyEnCalcularPrestamo = false;

const contenedor = document.getElementById("section-container"); // referencia del contendor donde cargo las secciones que muestro al usuario

const botonPersonal = document.getElementById("btn-persona");
botonPersonal.addEventListener("click", () => {
  datos = {
    ...datos,
    tipoDeUsario: "persona",
  };
  cargarSeccion();
});

const botonEmpresa = document.getElementById("btn-empresa");
botonEmpresa.addEventListener("click", () => {
  datos = {
    ...datos,
    tipoDeUsario: "empresa",
  };
  cargarSeccion();
});
function cargarSeccion() {
  if (datos.tipoDeUsario === "persona") {
    fetch(`section/seccionPersona.html`)
      .then((response) => response.text())
      .then((data) => {
        contenedor.innerHTML = data;
      })
      .catch((error) =>
        console.error("Error al cargar la sección persona:", error)
      );
  } else if (datos.tipoDeUsario === "empresa") {
    fetch(`section/seccionEmpresa.html`)
      .then((response) => response.text())
      .then((data) => {
        contenedor.innerHTML = data;
      })
      .catch((error) =>
        console.error("Error al cargar la sección empresa:", error)
      );
  }
}

const botonSiguiente = document.getElementById("btn-next"); // referencia del boton para navegar a proximas secciones desde que selecciono personal / empresa
botonSiguiente.addEventListener("click", cargarSiguienteSeccion);
function cargarSiguienteSeccion() {
  if (datos.tipoDeUsario === "persona") {
    datos = {
      ...datos,
      nombreCompleto: document.getElementById("nombreCompleto").value,
      dni: Number(document.getElementById("dni").value),
    };
  } else {
    datos = {
      ...datos,
      nombreEmpresa: document.getElementById("nombreEmpresa").value,
      cuit: Number(document.getElementById("cuit").value),
    };
  }

  const usuarioLlenoLosInputs =
    (datos.nombreCompleto?.trim() !== "" && !isNaN(datos.dni)) ||
    (datos.nombreEmpresa?.trim() !== "" && !isNaN(datos.cuit));

  if (!usuarioLlenoLosInputs) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Necesitas completar los inputs",
    });
    return;
  }

  const usuarioEncontrado = usuarios.some((user) => {
    return (
      user.nombreCompleto === datos.nombreCompleto && user.dni === datos.dni
    );
  });

  const empresaEncontrada = empresas.some((empresa) => {
    return (
      empresa.nombreEmpresa === datos.nombreEmpresa &&
      empresa.cuit === datos.cuit
    );
  });

  if (usuarioEncontrado || empresaEncontrada) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Ya solicitó un préstamo. En caso de que no sea así, comuníquese al número 0800 555 333. (profe no llame)",
    });
  } else {
    let datosParaGuardar;
    if (!usuarioEncontrado) {
      datosParaGuardar = [...usuarios, datos];
    } else if (!empresaEncontrada) {
      datosParaGuardar = [...empresas, datos];
    }
    localStorage.setItem("usuarios", JSON.stringify(datosParaGuardar));

    fetch(`section/section1.html`)
      .then((response) => response.text())
      .then((data) => {
        contenedor.innerHTML = data;
        onDOMContentLoaded();
      })
      .catch((error) => console.error("Error al cargar la sección:", error));
  }
}

let inputMonto;
let inputInteres;
let inputPlazo;
let botonCalcular;
function onDOMContentLoaded() {
  montoInput = document.getElementById("monto");
  interesInput = document.getElementById("interes");
  plazoInput = document.getElementById("plazo");
  botonCalcular = document.getElementById("calcular");

  botonCalcular.addEventListener("click", function (event) {
    event.preventDefault(); // Evitar que el botón realice su acción predeterminada
    simularPrestamo();
  });
}

async function simularPrestamo() {
  const monto = parseFloat(montoInput.value);
  const interes = parseFloat(interesInput.value);
  const plazo = parseInt(plazoInput.value);

  if (isNaN(monto) && isNaN(interes) && isNaN(plazo) && plazo > 0) {
    Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "Por favor ingrese valores validos.",
    });
  } else {
    let cuota = calcularCuota(monto, interes, plazo).toFixed(2);
    Swal.fire({
      title: "Resultado de solicitud de préstamo",
      html: `
        <p>Monto ingresado: ${monto} pesos</p>
        <p>Tasa de interés: ${interes}%</p>
        <p>Cuotas: ${plazo} meses</p>
        <p>La cuota de tu préstamo es:${cuota}pesos</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Aceptar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { value: email } = await Swal.fire({
          title: "Ingresa tu email",
          input: "email",
          inputLabel: "Ingresa tu email",
          inputPlaceholder: "Ingresa tu email",
        });

        if (email) {
          Swal.fire("Solicitud enviada!", "", "success").then(() => {
            Swal.fire({
              title: "¿Deseas solicitar otro préstamo?",
              showCancelButton: true,
              confirmButtonText: "Solicitar otro préstamo",
              cancelButtonText: "Salir",
            }).then((result) => {
              if (result.isConfirmed) {
                cargarSeccion();
              } else {
                Swal.fire(
                  "Gracias por solicitar un préstamo con nosotros",
                  "",
                  "success"
                ).then(() => {
                  window.location.href = "index.html";
                });
              }
            });
          });
        }
      }
    });
  }
}

function calcularCuota(monto, interes, plazo) {
  // Calculo de tasa mensual
  const tasaMensual = interes / 12;

  // Calculo de cuota pura
  const cuotaPura = monto / plazo;

  // Calculo de cuota con interes mensual
  const cuotaConInteres = cuotaPura + (cuotaPura * tasaMensual) / 100;

  return cuotaConInteres;
}
