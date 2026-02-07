<template>
  <div class="layout">
    <Sidebar />

    <div v-if="!mostrarFormularioDevolucion" class="devolucion-panel">
      <h2>Devolución de una Venta</h2>

      <div class="table-controls">
        <input
          type="text"
          v-model="busqueda"
          placeholder="Buscar por cliente o NID..."
          class="search-input"
        />
      </div>

      <table class="tabla-transacciones">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>NID</th>
            <th>Responsable</th>
            <th>Estado / Productos</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(transaccion, index) in transaccionesFiltradas"
            :key="index"
            @click="!esVentaDevuelta(transaccion.id) && seleccionarTransaccion(transaccion)"
            :class="{ 
              'fila-deshabilitada': esVentaDevuelta(transaccion.id),
              'cargando-fila': cargandoDetalles === transaccion.id 
            }"
          >
            <td class="col-fecha">{{ formatoFecha(transaccion.createdAt) }}</td>
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
        <button class="guardar" @click="guardarDevolucion" :disabled="cargando || totalDevolverUSD === 0">
          {{ cargando ? 'Procesando...' : 'Registrar Devolución' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarUser.vue'

const transacciones = ref([])
const listaDevoluciones = ref([])
const busqueda = ref('')
const mostrarFormularioDevolucion = ref(false)
const transaccionSeleccionada = ref(null)
const devoluciones = ref([])
const cargando = ref(false)
const cargandoDetalles = ref(null) 
const tasaCambio = ref(0)

onMounted(() => {
  fetchDatos()
  obtenerTasa()
})

async function obtenerTasa() {
  try {
    const res = await fetch('http://localhost:8080/currency/exchange_rate')
    if (res.ok) {
      const texto = await res.text()
      tasaCambio.value = parseFloat(texto)
    }
  } catch (e) { console.error("Error tasa:", e) }
}

const totalDevolverUSD = computed(() =>
  devoluciones.value.reduce((total, p) => total + p.precio * p.devolver, 0)
)

const idsVentasDevueltas = computed(() => new Set(listaDevoluciones.value.map(d => d.sale.id)))

function esVentaDevuelta(saleId) {
  return idsVentasDevueltas.value.has(saleId)
}

const transaccionesFiltradas = computed(() => {
  const filtradas = transacciones.value.filter(t =>
    t.client.nid.toLowerCase().includes(busqueda.value.toLowerCase()) ||
    t.client.fullName.toLowerCase().includes(busqueda.value.toLowerCase())
  )
  return filtradas.sort((a, b) => esVentaDevuelta(a.id) - esVentaDevuelta(b.id))
})

async function seleccionarTransaccion(transaccion) {
  cargandoDetalles.value = transaccion.id;
  
  try {
    const itemsPrometidos = transaccion.items.map(async (i) => {
      // Extraer ID del SKU (Ej: ZAP-1-40-NEGRO -> partes[1] = "1")
      const partesSku = i.productDetail.sku.split('-');
      const productId = partesSku[1]; 

      let nombreProducto = "Producto";
      let marcaProducto = "---";

      try {
        const res = await fetch(`http://localhost:8080/product/${productId}`);
        if (res.ok) {
          const data = await res.json();
          nombreProducto = data.name;
          marcaProducto = data.brand?.name || "Sin Marca";
        }
      } catch (err) {
        console.error("Error cargando producto:", err);
      }

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
  } catch (error) {
    alert("Error al procesar los detalles");
  } finally {
    cargandoDetalles.value = null;
  }
}

function volverTabla() {
  mostrarFormularioDevolucion.value = false
  transaccionSeleccionada.value = null
  devoluciones.value = []
}

function limpiarFormulario() {
  devoluciones.value.forEach(p => (p.devolver = 0))
}

async function fetchDatos() {
  try {
    const [resSales, resDevs] = await Promise.all([
      fetch('http://localhost:8080/sale'),
      fetch('http://localhost:8080/devolution')
    ])
    const sales = await resSales.json()
    const devs = await resDevs.json()
    transacciones.value = Array.isArray(sales) ? sales : []
    listaDevoluciones.value = Array.isArray(devs) ? devs : []
  } catch (error) { console.error('Error:', error) }
}

async function guardarDevolucion() {
  const itemsParaEnviar = devoluciones.value
    .filter(p => p.devolver > 0)
    .map(p => ({
      productDetailId: p.productDetailId,
      quantity: p.devolver
    }))

  const body = {
    employeeId: 2, 
    items: itemsParaEnviar,
    clientId: transaccionSeleccionada.value.client.id,
    saleId: transaccionSeleccionada.value.id
  }

  cargando.value = true
  try {
    const response = await fetch('http://localhost:8080/devolution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (response.ok) {
      alert('Devolución registrada exitosamente');
      volverTabla();
      await fetchDatos();
    }
  } catch (error) { alert('Error de conexión'); }
  finally { cargando.value = false }
}

function formatoBs(v) {
  return 'Bs ' + parseFloat(v || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
}

function formatoFecha(timestamp) {
  return new Date(timestamp).toLocaleDateString()
}
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background-color: #f0fdf4; }

.devolucion-panel, .devolucion-formulario {
  background-color: #f0fdf4; padding: 2rem; border-radius: 12px;
  font-family: "Inter", sans-serif; flex: 1; display: flex;
  flex-direction: column; gap: 1.5rem;
}

.top-actions { display: flex; flex-direction: column; gap: 1rem; }
.tasa-info {
  text-align: left; font-size: 1.1rem; color: #065f46;
  background-color: #d1fae5; padding: 0.6rem 1rem; border-radius: 8px;
  border-left: 4px solid #10b981; width: fit-content;
}
.venta-info {
  text-align: left; font-size: 1rem; color: #065f46;
  background-color: #ffffff; padding: 0.8rem 1rem; border-radius: 8px;
  border: 1px solid #a7f3d0;
}
.divider { margin: 0 10px; color: #34d399; }

/* TABLAS */
.tabla-transacciones, .tabla-productos-form {
    width: 100%; border-collapse: collapse; font-size: 0.95rem;
    background-color: #fff; border-radius: 8px; overflow: hidden;
}
.tabla-transacciones thead, .tabla-productos-form thead { background-color: #d1fae5; color: #065f46; }
.tabla-transacciones td, th, .tabla-productos-form td, th { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; text-align: left; }

/* ESTILOS DE PRODUCTO (Copiados del carrito) */
.nombre-producto { font-weight: 600; color: #111827; line-height: 1.2; }
.subtexto-marca { font-size: 0.75rem; color: #6b7280; }

.cargando-fila { opacity: 0.5; pointer-events: none; }

.col-fecha, .col-cliente, .col-nid { color: #111827; font-weight: 500; }

.fila-deshabilitada { background-color: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
.tabla-transacciones tbody tr:not(.fila-deshabilitada) { cursor: pointer; }
.tabla-transacciones tbody tr:not(.fila-deshabilitada):hover { background-color: #ecfdf5; }

.col-precio-dual { min-width: 120px; }
.bs-price { font-size: 1rem; color: #111827; }
.usd-price { font-size: 0.85rem; color: #10b981; font-weight: 600; }

.total-pagar-dual {
  text-align: right; padding: 1rem; background-color: #ffffff;
  border-radius: 8px; border: 1px solid #a7f3d0; margin-bottom: 1rem;
}
.total-label { font-size: 0.9rem; color: #6b7280; margin-bottom: 0.2rem; }
.monto-bs { font-size: 1.4rem; color: #166534; font-weight: 700; }
.monto-usd { font-size: 1.2rem; color: #10b981; font-weight: 700; }

.bottom-actions-container { display: flex; justify-content: flex-end; gap: 12px; margin-top: 1rem; }

.sku-tag {
  background-color: #e2e8f0; color: #475569; padding: 0.3rem 0.6rem;
  border-radius: 4px; font-family: monospace; font-weight: bold; font-size: 0.85rem; border: 1px solid #cbd5e1;
}
.select-cantidad { padding: 0.4rem; border-radius: 6px; border: 1px solid #a7f3d0; width: 70px; text-align: center; }
.badge-devuelto { background-color: #fee2e2; color: #b91c1c; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.75rem; font-weight: bold; }
.badge-items { background-color: #dcfce7; color: #166534; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.75rem; }
.search-input { padding: 0.7rem; border: 1px solid #a7f3d0; border-radius: 8px; width: 300px; }
.table-controls { display: flex; justify-content: flex-end; margin-bottom: 1rem; }

button { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
button.guardar { background-color: #10b981; color: white; }
button.secundario { background-color: #d1fae5; color: #065f46; }
button.cancelar { background-color: #f3f4f6; color: #374151; }
button:hover:not(:disabled) { filter: brightness(0.9); }
button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>