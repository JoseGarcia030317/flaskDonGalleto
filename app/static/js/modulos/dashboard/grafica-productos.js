import { api } from '../../utils/api.js';

function cargarGraficasDashboard(){
    GraficaVentasDiarias();
    GraficaProMasVendidos();
    GraficaPreMasVendidos();
    prueba();
}

function GraficaVentasDiarias(){
    api.getJSON('/dashboard/get_daily_sales')
    .then(data => {
        if (data && Array.isArray(data)) {
            console.log(data);
            let totalCompras = 0;
            let totalEntrada = 0;
            let totalSalidaConCompra = 0;
            
            // Recorremos los datos y sumamos según el tipo
            data.forEach(item => {
                if (item.tipo === 'compras') {
                    totalCompras = item.resultado.total_compras;
                }
                if (item.tipo === 'ventas') {
                    totalEntrada = item.resultado.total_entrada;
                    totalSalidaConCompra = item.resultado.total_salida + totalCompras;
                }
            });

            const ctx = document.getElementById('ventasDiarias');

            if (!ctx) {
                console.error("Error: No se encontró el elemento con id 'ventasDiarias'");
                return;
            }
        
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Entrada Dinero', 'Salida Dinero'],
                    datasets: [{
                        label: '$ ',
                        data: [totalEntrada, totalSalidaConCompra],
                        backgroundColor: ['#efe6dc', '#bf9578'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    
                },
            });
            
            
        } else {
            console.error("Error: Datos recibidos no válidos.");
        }
    })
    .catch(error => {
        console.error("Error al obtener los datos del API:", error);
    });
}

function GraficaProMasVendidos() {
    api.getJSON('/dashboard/best_selling_product')
        .then(data => {
            if (data && Array.isArray(data)) {

                const labels = data.map(item => item.product_name);
                const quantities = data.map(item => item.quantity);
                const amounts = data.map(item => item.amount);

                const backgroundColors = [
                    '#e4d4c4', 
                    '#d2b79f', 
                    '#bf9578', 
                    '#b27c5d', 
                    '#a46a52',

                  ];
                  
                  const borderColors = [
                    '#e4d4c4', 
                    '#d2b79f', 
                    '#bf9578', 
                    '#b27c5d', 
                    '#a46a52',
                  ];

                const ctx = document.getElementById('PreMasVendidos');

                if (!ctx) {
                    console.error("Error: No se encontró el elemento con id 'PreMasVendidos'");
                    return;
                }

                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Productos Más Vendidos',
                            data: quantities,
                            backgroundColor: backgroundColors,
                            borderColor: borderColors,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        plugins: {
                            tooltip: {
                              callbacks: {
                                // Título del tooltip (normalmente el nombre del producto)
                                title: function(context) {
                                  // El "label" por defecto es context[0].label
                                  return context[0].label;
                                },
                                // Contenido de cada ítem del tooltip
                                label: function(context) {
                                  // index de la barra actual
                                  const index = context.dataIndex;
                                  // amounts[index] = monto que deseas mostrar
                                  const value = amounts[index].toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                  });
                                  return `Monto Vendido: $ ${value}`;
                                }
                              }
                        }}
                    }
                });
            } else {
                console.error("Error: Datos recibidos no válidos.");
            }
        })
        .catch(error => {
            console.error("Error al obtener los datos del API:", error);
        });
};


function GraficaPreMasVendidos(){
    api.getJSON('/dashboard/best_selling_presentations')
    .then(data => {
        if (data && Array.isArray(data)) {

            const labels = data.map(item => item.presentation_name);
            const quantities = data.map(item => item.quantity);
            const quantities_cookies = data.map(item => item.quantity_cookie);
            const amounts = data.map(item => item.amount);

            const backgroundColors = [
                '#e4d4c4', 
                '#d2b79f', 
                '#bf9578', 
                '#b27c5d', 
                '#a46a52',

              ];
              
              const borderColors = [
                '#e4d4c4', 
                '#d2b79f', 
                '#bf9578', 
                '#b27c5d', 
                '#a46a52',
              ];

            const ctx = document.getElementById('ProMasVendidos');

            if (!ctx) {
                console.error("Error: No se encontró el elemento con id 'ProMasVendidos'");
                return;
            }

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Presentaciones Más Vendidas',
                        data: quantities,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        tooltip: {
                          callbacks: {
                            title: function(context) {
                              return context[0].label;
                            },
                            label: function(context) {
                              const index = context.dataIndex;
                              const value = amounts[index].toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              });

                              const value_quantities = quantities_cookies[index];
                              
                              return [
                                `Monto Vendido: ${value}`,
                                `Cantidad Galletas por presentación: ${value_quantities}`
                              ];
                            }
                          }
                        }}
                }
            });
        } else {
            console.error("Error: Datos recibidos no válidos.");
        }
    })
    .catch(error => {
        console.error("Error al obtener los datos del API:", error);
    });
};

function prueba(){
    api.getJSON('/dashboard/get_daily_sales')
    .then(data => {
        if (data && Array.isArray(data)) {
            console.log(data);
            
            // Inicializamos las variables que contendrán las sumas
            let totalCompras = 0;
            let totalEntrada = 0;
            let totalSalidaConCompra = 0;
            
            // Recorremos los datos y sumamos según el tipo
            data.forEach(item => {
                if (item.tipo === 'compras') {
                    totalCompras = item.resultado.total_compras;
                }
                if (item.tipo === 'ventas') {
                    totalEntrada = item.resultado.total_entrada;
                    totalSalidaConCompra = item.resultado.total_salida + totalCompras;
                }
            });
            
            console.log("Total Compras: ", totalCompras);
            console.log("Total Entrada: ", totalEntrada);
            console.log("Total Salida con Compra: ", totalSalidaConCompra);
            
        } else {
            console.error("Error: Datos recibidos no válidos.");
        }
    })
    .catch(error => {
        console.error("Error al obtener los datos del API:", error);
    });
}


window.cargarGraficasDashboard = cargarGraficasDashboard;
window.GraficaVentasDiarias = GraficaVentasDiarias;
window.GraficaProMasVendidos = GraficaProMasVendidos;
window.GraficaPreMasVendidos = GraficaPreMasVendidos;
window.prueba = prueba;