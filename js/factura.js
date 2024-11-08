const USER_KEY = "user";
const STORAGE_KEY = "carroItems"; 
const USER_API_URL = `http://localhost:8080/user/get`; 

// Inicializar carrito desde el localStorage
let carroItems = cargarCarroDesdeLocalStorage() || {};

// Obtener los productos desde localStorage
const productos = JSON.parse(localStorage.getItem("products")) || [];

// Obtener el usuario almacenado en localStorage
const user = JSON.parse(localStorage.getItem(USER_KEY));

console.log("Usuario almacenado en localStorage:", user); // Verificar los datos del usuario en localStorage

if (user && user.orders && user.orders.length > 0) {
    // Mostrar las órdenes para depurar
    console.log("Órdenes del usuario:", user.orders);

    // Obtener la última orden
    const lastOrder = user.orders[user.orders.length - 1];  // Asegurarse de que se obtiene la última orden

    if (lastOrder) {
        console.log("Última orden:", lastOrder); // Verificar la última orden

        const { date, discount, subTotal, total, oderDetails } = lastOrder;

        // Verificar si orderDetails existe y es un array con datos
        console.log("Detalles de la última orden (orderDetails):", oderDetails);

        if (Array.isArray(oderDetails) && oderDetails.length > 0) {
            console.log("Detalles de la última orden:", oderDetails); // Verificar los detalles de la orden

            // Actualizar la factura con los datos de la última orden
            document.getElementById('factura').textContent = `Factura de ${user.nameUser} ${user.lastName}`;
            document.querySelector('.checkout-btn').innerHTML = `        
                <img src="../img/background/delivery.png" alt="Delivery Icon" class="icono-envio">
                ¡Gracias por tu compra! Tu factura será enviada a ${user.emailUser}
            `;

            // Mostrar la fecha de la orden
            const formattedDate = new Date(date).toLocaleDateString("es-CO", {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            // Mostrar los detalles de la orden en la factura
            document.querySelector(".factura-resumen .factura-detalles").innerHTML = `
                <p>Fecha: <span>${formattedDate}</span></p>
                <p>Subtotal: <span>$${subTotal.toLocaleString("es-CO")}</span></p>
                <p>Descuento (-${discount}%): <span>$${(subTotal * (discount / 100)).toLocaleString("es-CO")}</span></p>
                <p>Envío: <span>$0.00</span></p>
                <h4>Total: <span>$${total.toLocaleString("es-CO")}</span></h4>
                <hr>
            `;

            // Listar los detalles de la orden (productos)
            listarDetallesOrden(oderDetails, discount);
        } else {
            console.error("La última orden no tiene detalles o está vacía.");
        }
    } else {
        console.error("No se encontró la última orden.");
    }
} else {
    console.error("No se encontró el usuario en localStorage o el usuario no tiene órdenes.");
}

// Función para listar los detalles de la orden
function listarDetallesOrden(oderDetails, discount) {
    const contenedorCarrito = document.querySelector("#contenedorFactura");
    contenedorCarrito.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos productos
    
    let total = 0;
    oderDetails.forEach((detalle) => {
        const { idProduct, quantity, price } = detalle;

        // Obtener el producto correspondiente desde productos de localStorage
        const product = productos.find((item) => item.idProduct === idProduct);
        
        if (!product) return; // Si no se encuentra el producto, se omite el detalle
        
        const { nameProduct, img, unitsPackage } = product; // Asumimos que `unitsPackage` es el pack del producto
        
        const totalItem = price * quantity;
        total += totalItem;

        // Generar el HTML para la fila de la tabla
        const itemHTML = `
            <tr>
                <td><img src="${img}" alt="${nameProduct}" class="producto-imagen shadow" style="width: 50px; height: 50px;"></td>
                <td>${nameProduct}</td>
                <td>${unitsPackage}</td> <!-- Pack de producto -->
                <td>$${totalItem.toLocaleString("es-CO")}</td> <!-- Precio total -->
                <td style="text-align: center;">${quantity}</td> <!-- Cantidad -->
            </tr>
        `;
        contenedorCarrito.innerHTML += itemHTML; // Agregar la fila a la tabla
    });

    // Calcular el total con descuento
    const totalConDescuento = total - (total * (discount / 100));

    // Mostrar el total de la orden con descuento
    const totalHTML = `
        <tr>
            <td colspan="4" style="text-align: right;"><strong>Total con Descuento:</strong></td>
            <td><strong>$${totalConDescuento.toLocaleString("es-CO")}</strong></td>
        </tr>
    `;
    contenedorCarrito.innerHTML += totalHTML; // Agregar el total de la orden con descuento
}

// Función para cargar el carrito desde localStorage
function cargarCarroDesdeLocalStorage() {
    const carroGuardado = localStorage.getItem(STORAGE_KEY);
    return carroGuardado ? JSON.parse(carroGuardado) : null;
}

// Función para obtener el usuario desde la API por ID
async function obtenerUsuarioPorId(idUser) {
  try {
    const response = await fetch(`${USER_API_URL}/${idUser}`);
    
    if (!response.ok) {
      throw new Error("Error al obtener el usuario de la API");
    }
    
    const userData = await response.json();
    // Reemplaza el usuario en localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    console.log("Usuario actualizado en localStorage:", userData);

    // Actualizar la factura después de obtener el usuario
    actualizarFactura();

  } catch (error) {
    console.error("Error al obtener el usuario:", error);
  }
}

// Función para actualizar la factura después de obtener los datos del usuario
function actualizarFactura() {
    const storedUser = JSON.parse(localStorage.getItem(USER_KEY));
    if (storedUser && storedUser.orders && storedUser.orders.length > 0) {
        const lastOrder = storedUser.orders[storedUser.orders.length - 1];
        const { date, discount, subTotal, total, oderDetails } = lastOrder;
        if (Array.isArray(oderDetails) && oderDetails.length > 0) {
            document.getElementById('factura').textContent = `Factura de ${storedUser.nameUser} ${storedUser.lastName}`;
            document.querySelector('.checkout-btn').innerHTML = `        
                <img src="../img/background/delivery.png" alt="Delivery Icon" class="icono-envio">
                ¡Gracias por tu compra! Tu factura será enviada a ${storedUser.emailUser}
            `;
            const formattedDate = new Date(date).toLocaleDateString("es-CO", {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            document.querySelector(".factura-resumen .factura-detalles").innerHTML = `
                <p>Fecha: <span>${formattedDate}</span></p>
                <p>Subtotal: <span>$${subTotal.toLocaleString("es-CO")}</span></p>
                <p>Descuento (-${discount}%): <span>$${(subTotal * (discount / 100)).toLocaleString("es-CO")}</span></p>
                <p>Envío: <span>$0.00</span></p>
                <h4>Total: <span>$${total.toLocaleString("es-CO")}</span></h4>
                <hr>
            `;
            listarDetallesOrden(oderDetails, discount);
        }
    }
}

// Inicializar usuario al cargar la página
document.addEventListener("DOMContentLoaded", function() {
  const storedUser = JSON.parse(localStorage.getItem(USER_KEY));

  if (storedUser) {
    obtenerUsuarioPorId(storedUser.idUser);
  }
});
