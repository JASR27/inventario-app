<template>
  <div class="layout">
    <Sidebar />

    <div v-if="!mostrarFormularioDevolucion" class="devolucion-panel">
      <h2>Devolución de una Venta</h2>

      <div class="toolbar">
        <div class="control-group">
          <label>Buscar por:</label>
          <select v-model="campoBusqueda" class="select-input">
            <option value="todos">Todos los campos</option>
            <option value="fecha">Fecha (DD/MM/AAAA)</option>
            <option value="id">Nro. Venta</option>
            <option value="fullName">Cliente</option>
            <option value="nid">NID / Cédula</option>
            <option value="employee">Responsable</option>
          </select>

          <input type="text" v-model="busqueda" :placeholder="placeholderBusqueda" class="search-input" />
        </div>

        <div class="control-group">
          <label>Ordenar por:</label>
          <select v-model="criterioOrden" class="select-input">
            <option value="createdAt">Fecha</option>
            <option value="id">Nro. Venta</option>
            <option value="fullName">Cliente</option>
            <option value="employee">Responsable</option>
          </select>
          <button @click="ordenAscendente = !ordenAscendente" class="btn-orden">
            {{ ordenAscendente ? 'Ascendente ▲' : 'Descendente ▼' }}
          </button>
        </div>
      </div>

      <table class="tabla-transacciones">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Nro. Venta</th>
            <th>Cliente</th>
            <th>NID</th>
            <th>Responsable</th>
            <th>Estado / Productos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(transaccion, index) in transaccionesFiltradas" :key="index"
            @click="!esVentaDevuelta(transaccion.id) && seleccionarTransaccion(transaccion)" :class="{
              'fila-deshabilitada': esVentaDevuelta(transaccion.id),
              'cargando-fila': cargandoDetalles === transaccion.id
            }">
            <td class="col-fecha">{{ formatoFecha(transaccion.createdAt) }}</td>
            <td>#{{ transaccion.id }}</td>
            <td class="col-cliente">{{ transaccion.client.fullName }}</td>
            <td class="col-nid">{{ transaccion.client.nid }}</td>
            <td>{{ transaccion.employee.firstName }} {{ transaccion.employee.lastName }}</td>
            <td>
              <span v-if="esVentaDevuelta(transaccion.id)" class="badge-devuelto">YA DEVUELTA</span>
              <span v-else class="badge-items">
                {{ cargandoDetalles === transaccion.id ? 'Cargando...' : transaccion.items.length + ' ítems' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="devolucion-formulario">
      <h2>Registrar Devolución</h2>

      <div class="top-actions">
        <div class="tasa-info" v-if="tasaCambio > 0">
          <small>Tasa del día: <strong>1$ = {{ formatoBs(tasaCambio) }}</strong></small>
        </div>

        <div class="venta-info">
          <small>
            Cliente: <strong>{{ transaccionSeleccionada.client.fullName }}</strong>
            <span class="divider">|</span>
            NID: <strong>{{ transaccionSeleccionada.client.nid }}</strong>
            <span class="divider">|</span>
            Venta: <strong>#{{ transaccionSeleccionada.id }}</strong>
            <span class="divider">|</span>
            Fecha: <strong>{{ formatoFecha(transaccionSeleccionada.createdAt) }}</strong>
          </small>
        </div>
      </div>

      <table class="tabla-productos-form">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th>Color</th>
            <th>Talla</th>
            <th>Precio Unit.</th>
            <th>Cant. Comprada</th>
            <th>Cant. a Devolver</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(producto, index) in devoluciones" :key="index">
            <td><code class="sku-tag">{{ producto.sku }}</code></td>
            <td>
              <div class="nombre-producto">{{ producto.name }}</div>
              <div class="subtexto-marca">{{ producto.brand }}</div>
            </td>
            <td>{{ producto.color }}</td>
            <td>{{ producto.talla }}</td>
            <td class="col-precio-dual">
              <div class="bs-price"><strong>{{ producto.precio.toFixed(2) }}$</strong></div>
              <div class="usd-price" v-if="tasaCambio > 0">{{ formatoBs(producto.precio * tasaCambio) }}</div>
            </td>
            <td style="text-align: center;">{{ producto.cantidad }}</td>
            <td>
              <select v-model.number="producto.devolver" :disabled="cargando" class="select-cantidad">
                <option v-for="n in producto.cantidad + 1" :key="n" :value="n - 1">{{ n - 1 }}</option>
              </select>
            </td>
            <td class="col-precio-dual">
              <div class="bs-price"><strong>{{ (producto.precio * producto.devolver).toFixed(2) }}$</strong></div>
              <div class="usd-price" v-if="tasaCambio > 0 && producto.devolver > 0">
                {{ formatoBs(producto.precio * producto.devolver * tasaCambio) }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="total-pagar-dual">
        <div class="total-label">Total a Reembolsar:</div>
        <div class="total-monto">
          <span class="monto-bs">{{ totalDevolverUSD.toFixed(2) }}$</span>
          <span class="monto-usd" v-if="tasaCambio > 0"> / {{ formatoBs(totalDevolverUSD * tasaCambio) }}</span>
        </div>
      </div>

      <div class="bottom-actions-container">
        <button class="cancelar" @click="volverTabla" :disabled="cargando">Volver</button>
        <button class="secundario" @click="limpiarFormulario" :disabled="cargando">Limpiar</button>
        <button class="guardar" @click="guardarDevolucion" :disabled="cargando">
          {{ cargando ? 'Procesando...' : 'Registrar Devolución' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '../../store/useNotificationStore.js'
import Sidebar from '../../components/Generic Components/SidebarUser.vue'

const notificationStore = useNotificationStore()

// --- ESTADOS ---
const transacciones = ref([])
const listaDevoluciones = ref([])
const mostrarFormularioDevolucion = ref(false)
const transaccionSeleccionada = ref(null)
const devoluciones = ref([])
const cargando = ref(false)
const cargandoDetalles = ref(null)
const tasaCambio = ref(0)

// Controles Tabla Principal
const busqueda = ref('')
const campoBusqueda = ref('todos')
const criterioOrden = ref('createdAt')
const ordenAscendente = ref(false)

onMounted(() => {
  fetchDatos()
  obtenerTasa()
})

// --- LÓGICA DE FILTRADO ---
const placeholderBusqueda = computed(() => {
  const ops = {
    todos: 'Buscar en todos los campos...',
    id: 'Ej: #15...',
    nid: 'Ej: V-12345678',
    fullName: 'Nombre del cliente...',
    employee: 'Nombre del empleado...',
    fecha: 'Ej: 14/02/2026'
  }
  return ops[campoBusqueda.value]
})

const transaccionesFiltradas = computed(() => {
  let list = [...transacciones.value]

  if (busqueda.value) {
    const t = busqueda.value.toLowerCase()
    list = list.filter(tr => {
      const idVenta = tr.id.toString()
      const cliente = tr.client.fullName.toLowerCase()
      const nid = tr.client.nid.toLowerCase()
      const empleado = `${tr.employee.firstName} ${tr.employee.lastName}`.toLowerCase()
      const fecha = formatoFecha(tr.createdAt).toLowerCase()

      if (campoBusqueda.value === 'id') return idVenta.includes(t)
      if (campoBusqueda.value === 'nid') return nid.includes(t)
      if (campoBusqueda.value === 'fullName') return cliente.includes(t)
      if (campoBusqueda.value === 'employee') return empleado.includes(t)
      if (campoBusqueda.value === 'fecha') return fecha.includes(t)

      return idVenta.includes(t) || cliente.includes(t) || nid.includes(t) || empleado.includes(t) || fecha.includes(t)
    })
  }

  list.sort((a, b) => {
    let valA, valB
    if (criterioOrden.value === 'employee') {
      valA = `${a.employee.firstName} ${a.employee.lastName}`.toLowerCase()
      valB = `${b.employee.firstName} ${b.employee.lastName}`.toLowerCase()
    } else if (criterioOrden.value === 'fullName') {
      valA = a.client.fullName.toLowerCase()
      valB = b.client.fullName.toLowerCase()
    } else {
      valA = a[criterioOrden.value]
      valB = b[criterioOrden.value]
    }

    const devA = esVentaDevuelta(a.id)
    const devB = esVentaDevuelta(b.id)
    if (devA !== devB) return devA - devB

    const res = typeof valA === 'string' ? valA.localeCompare(valB) : (valA || 0) - (valB || 0)
    return ordenAscendente.value ? res : -res
  })

  return list
})

// --- FUNCIONES ---
async function obtenerTasa() {
  try {
    const res = await fetch('http://localhost:8080/currency/exchange_rate')
    if (res.ok) tasaCambio.value = parseFloat(await res.text())
  } catch (e) {
    notificationStore.addNotification("Error Tasa", "No se pudo obtener la tasa de cambio.", "error")
  }
}

const totalDevolverUSD = computed(() =>
  devoluciones.value.reduce((total, p) => total + p.precio * p.devolver, 0)
)

const idsVentasDevueltas = computed(() => new Set(listaDevoluciones.value.map(d => d.sale.id)))

function esVentaDevuelta(saleId) {
  return idsVentasDevueltas.value.has(saleId)
}

async function seleccionarTransaccion(transaccion) {
  cargandoDetalles.value = transaccion.id;
  try {
    const itemsPrometidos = transaccion.items.map(async (i) => {
      const partesSku = i.productDetail.sku.split('-');
      const productId = partesSku[1];
      let nombreProducto = "Producto", marcaProducto = "---";

      try {
        const res = await fetch(`http://localhost:8080/product/${productId}`);
        if (res.ok) {
          const data = await res.json();
          nombreProducto = data.name;
          marcaProducto = data.brand?.name || "Sin Marca";
        }
      } catch (err) { console.error(err) }

      return {
        productDetailId: i.productDetail.id,
        sku: i.productDetail.sku,
        name: nombreProducto,
        brand: marcaProducto,
        color: i.productDetail.color,
        talla: i.productDetail.size,
        precio: parseFloat(i.amount),
        cantidad: i.quantity,
        devolver: 0
      };
    });

    devoluciones.value = await Promise.all(itemsPrometidos);
    transaccionSeleccionada.value = transaccion;
    mostrarFormularioDevolucion.value = true;
    notificationStore.addNotification("Venta Cargada", "Se han cargado los detalles del producto.", "info");
  } catch (error) {
    notificationStore.addNotification("Error", "No se pudo cargar la información de la venta.", "error");
  } finally {
    cargandoDetalles.value = null;
  }
}

async function guardarDevolucion() {
  // 1. Obtenemos solo los items que el usuario marcó para devolver
  const itemsParaEnviar = devoluciones.value
    .filter(p => p.devolver > 0)
    .map(p => ({
      productDetailId: p.productDetailId,
      quantity: p.devolver
    }));

  // 2. Notificación si intentan guardar estando todo en cero
  if (itemsParaEnviar.length === 0) {
    notificationStore.addNotification(
      "Acción Requerida",
      "No has seleccionado ningún producto para devolver. Por favor, aumenta la cantidad en al menos un ítem.",
      "warning"
    );
    return; // Detenemos la ejecución aquí
  }

  // 3. Si hay items, procedemos con la carga
  cargando.value = true;

  try {
    const body = {
      employeeId: getEmployeeIdFromCookie(),
      items: itemsParaEnviar,
      clientId: transaccionSeleccionada.value.client.id,
      saleId: transaccionSeleccionada.value.id
    };

    const response = await fetch('http://localhost:8080/devolution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      notificationStore.addNotification("Devolución Exitosa", "Los productos han reingresado al inventario.", "success");
      volverTabla();
      await fetchDatos();
    } else {
      const errorText = await response.text();
      notificationStore.addNotification("Error en Servidor", errorText, "error");
    }
  } catch (error) {
    notificationStore.addNotification("Error de Red", "No se pudo conectar con el servidor.", "error");
  } finally {
    cargando.value = false;
  }
}

async function fetchDatos() {
  try {
    const [resSales, resDevs] = await Promise.all([
      fetch('http://localhost:8080/sale'),
      fetch('http://localhost:8080/devolution')
    ])
    transacciones.value = await resSales.json()
    listaDevoluciones.value = await resDevs.json()
  } catch (error) {
    notificationStore.addNotification("Error", "No se pudo actualizar la lista de ventas.", "error")
  }
}

function getEmployeeIdFromCookie() {
  const match = document.cookie.match(/userid=(\d+)/)
  return match ? parseInt(match[1]) : 2 // Default 2 por seguridad
}

function volverTabla() {
  mostrarFormularioDevolucion.value = false
  transaccionSeleccionada.value = null
  devoluciones.value = []
}

function limpiarFormulario() {
  devoluciones.value.forEach(p => (p.devolver = 0))
  notificationStore.addNotification("Limpieza", "Se reiniciaron las cantidades.", "info")
}

function formatoBs(v) {
  return 'Bs ' + parseFloat(v || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
}

function formatoFecha(timestamp) {
  return new Date(timestamp).toLocaleDateString()
}
</script>

<style scoped>
/* REUTILIZACIÓN DE ESTILOS DE INVENTARIO */
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f0fdf4;
}

.devolucion-panel,
.devolucion-formulario {
  flex: 1;
  padding: 2rem;
  font-family: "Inter", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h2 {
  font-size: 1.6rem;
  color: #166534;
  text-align: center;
  margin-bottom: 0.5rem;
}

/* TOOLBAR ESTANDARIZADA */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  gap: 1rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.control-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.85rem;
}

.select-input,
.search-input {
  padding: 0.5rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  background-color: #fff;
  outline: none;
  font-size: 0.9rem;
}

.search-input {
  width: 250px;
}

.btn-orden {
  background-color: #34d399;
  color: white;
  border: none;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  min-width: 130px;
  font-size: 0.85rem;
}

.btn-orden:hover {
  background-color: #059669;
}

.top-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tasa-info {
  text-align: left;
  font-size: 1rem;
  color: #065f46;
  background-color: #d1fae5;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border-left: 4px solid #10b981;
  width: fit-content;
}

.venta-info {
  text-align: left;
  font-size: 0.95rem;
  color: #065f46;
  background-color: #ffffff;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid #a7f3d0;
}

.divider {
  margin: 0 10px;
  color: #34d399;
}

/* TABLAS */
.tabla-transacciones,
.tabla-productos-form {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tabla-transacciones thead,
.tabla-productos-form thead {
  background-color: #d1fae5;
  color: #065f46;
}

.tabla-transacciones td,
th,
.tabla-productos-form td,
th {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
}

.nombre-producto {
  font-weight: 600;
  color: #111827;
}

.subtexto-marca {
  font-size: 0.75rem;
  color: #6b7280;
}

.fila-deshabilitada {
  background-color: #f8fafc;
  color: #9ca3af;
  cursor: not-allowed;
}

.tabla-transacciones tbody tr:not(.fila-deshabilitada) {
  cursor: pointer;
}

.tabla-transacciones tbody tr:not(.fila-deshabilitada):hover {
  background-color: #f0fdf4;
}

.col-precio-dual {
  min-width: 130px;
}

.bs-price {
  font-size: 1rem;
  color: #111827;
}

.usd-price {
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 600;
}

.total-pagar-dual {
  text-align: right;
  padding: 1.2rem;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #a7f3d0;
  margin-top: 1rem;
}

.monto-bs {
  font-size: 1.5rem;
  color: #166534;
  font-weight: 700;
}

.monto-usd {
  font-size: 1.3rem;
  color: #10b981;
  font-weight: 700;
}

.bottom-actions-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 1rem;
}

.sku-tag {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
  border: 1px solid #e2e8f0;
}

.select-cantidad {
  padding: 0.4rem;
  border-radius: 6px;
  border: 1px solid #a7f3d0;
  width: 75px;
  text-align: center;
}

.badge-devuelto {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.3rem 0.6rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
}

.badge-items {
  background-color: #dcfce7;
  color: #166534;
  padding: 0.3rem 0.6rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

button.guardar {
  background-color: #10b981;
  color: white;
}

button.secundario {
  background-color: #d1fae5;
  color: #065f46;
}

button.cancelar {
  background-color: #f3f4f6;
  color: #374151;
}
</style>