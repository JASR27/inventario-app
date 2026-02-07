<template>
  <div class="layout">
    <Sidebar />

    <div class="reposicion-panel" v-if="!mostrarSelector">
      <h2>Registrar Reposición de Inventario</h2>

      <div class="top-actions">
        <div class="tasa-info" v-if="tasaCambio > 0">
          <small>Tasa del día: <strong>1$ = {{ formatoBs(tasaCambio) }}</strong></small>
        </div>

        <div class="proveedor-info">
          <div class="input-group">
            <label>Proveedor</label>
            <select v-model="proveedorSeleccionado" @change="actualizarNid">
              <option disabled value="">Seleccione proveedor</option>
              <option v-for="p in proveedores" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>

          <div class="input-group">
            <label>NID Proveedor</label>
            <input type="text" :value="nidProveedor" readonly placeholder="NID automático" class="input-readonly" />
          </div>

          <div class="input-group">
            <label>Factura</label>
            <input type="text" v-model="factura" placeholder="Nro de factura" />
          </div>

          <button class="secundario btn-derecha" @click="mostrarSelectorProductos">
            Agregar Producto
          </button>
        </div>
      </div>

      <table class="tabla-productos">
        <thead>
          <tr>
            <th style="width: 50px;"></th>
            <th>Producto</th>
            <th>Color</th>
            <th>Talla</th>
            <th>SKU</th> <th>Cantidad</th>
            <th>Costo Unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in carrito" :key="index">
            <td style="text-align: center;">
              <button class="btn-eliminar" @click="eliminarProducto(index)">×</button>
            </td>
            <td>
              <div class="nombre-producto">{{ item.nombre }}</div>
              <div class="subtexto-marca">{{ item.marca }}</div>
            </td>
            <td>
              <select v-model="item.color" @change="generarSKU(item)" class="select-table">
                <option disabled :value="null">Color</option>
                <option v-for="c in coloresBasicos" :key="c" :value="c">{{ c }}</option>
              </select>
            </td>
            <td>
              <select v-model="item.talla" @change="generarSKU(item)" class="select-table">
                <option disabled :value="null">Talla</option>
                <option v-for="t in tallasDisponibles" :key="t" :value="t">{{ t }}</option>
              </select>
            </td>
            <td>
              <span class="sku-badge" v-if="item.sku">{{ item.sku }}</span>
              <span class="sku-placeholder" v-else>Pendiente...</span>
            </td>
            <td>
              <input type="number" v-model.number="item.cantidad" min="1" class="input-cantidad" />
            </td>
            <td class="col-precio-dual">
              <div class="bs-price"><strong>{{ item.buyingPrice.toFixed(2) }}$</strong></div>
              <div class="usd-price" v-if="tasaCambio > 0">{{ formatoBs(item.buyingPrice * tasaCambio) }}</div>
            </td>
            <td class="col-precio-dual">
              <div class="bs-price"><strong>{{ (item.buyingPrice * (item.cantidad || 0)).toFixed(2) }}$</strong></div>
              <div class="usd-price" v-if="tasaCambio > 0">
                {{ formatoBs(item.buyingPrice * (item.cantidad || 0) * tasaCambio) }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="total-pagar-dual">
        <div class="total-label">Total Reposición:</div>
        <div class="total-monto">
          <span class="monto-bs">{{ totalGeneralUSD.toFixed(2) }}$</span>
          <span class="monto-usd" v-if="tasaCambio > 0"> / {{ formatoBs(totalGeneralUSD * tasaCambio) }}</span>
        </div>
      </div>

      <div class="bottom-actions-container">
        <button class="cancelar" @click="cancelarCarrito">Cancelar</button>
        <button class="secundario" @click="limpiarCarrito" :disabled="carrito.length === 0">Limpiar</button>
        <button class="guardar" @click="guardarCarrito" :disabled="carrito.length === 0">
          Confirmar Ingreso
        </button>
      </div>
    </div>

    <ProductSelector 
      v-if="mostrarSelector" 
      modo="compra" 
      @seleccionar="agregarProducto" 
      @cerrar="mostrarSelector = false" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarUser.vue'
import ProductSelector from '../../components/User Components/ProductSelector.vue'

const carrito = ref([])
const proveedores = ref([])
const proveedorSeleccionado = ref('')
const nidProveedor = ref('')
const factura = ref('')
const tasaCambio = ref(0)
const mostrarSelector = ref(false)

const coloresBasicos = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Gris', 'Amarillo']
const tallasDisponibles = Array.from({ length: 18 }, (_, i) => i + 28)

onMounted(() => {
  obtenerTasa()
  cargarProveedores()
})

async function obtenerTasa() {
  try {
    const res = await fetch('http://localhost:8080/currency/exchange_rate')
    if (res.ok) tasaCambio.value = parseFloat(await res.text())
  } catch (e) { console.error("Error tasa:", e) }
}

async function cargarProveedores() {
  try {
    const res = await fetch('http://localhost:8080/supplier')
    const data = await res.json()
    proveedores.value = data || []
  } catch (e) { console.error('Error proveedores:', e) }
}

function actualizarNid() {
  const proveedor = proveedores.value.find(p => p.id === proveedorSeleccionado.value)
  nidProveedor.value = proveedor ? proveedor.nid : ''
}

function agregarProducto(producto) {
  carrito.value.push({
    id: producto.id,
    nombre: producto.name,
    marca: producto.brand?.name || '',
    buyingPrice: parseFloat(producto.buyingPrice),
    color: null,
    talla: null,
    sku: '', // Campo para el SKU dinámico
    cantidad: 1
  })
  mostrarSelector.value = false
}

// Nueva función: Generar SKU dinámicamente
function generarSKU(item) {
  if (item.color && item.talla) {
    const prefix = item.nombre.substring(0, 3).toUpperCase()
    item.sku = `${prefix}-${item.id}-${item.talla}-${item.color.toUpperCase()}`
  } else {
    item.sku = ''
  }
}

const totalGeneralUSD = computed(() =>
  carrito.value.reduce((acc, i) => acc + (i.buyingPrice * (i.cantidad || 0)), 0)
)

function formatoBs(v) {
  return 'Bs ' + parseFloat(v || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
}

function getEmployeeIdFromCookie() {
  const match = document.cookie.match(/userid=(\d+)/)
  return match ? parseInt(match[1]) : null
}

function cancelarCarrito() {
  carrito.value = []
  proveedorSeleccionado.value = ''
  nidProveedor.value = ''
  factura.value = ''
}

function limpiarCarrito() {
  carrito.value = []
}

const mostrarSelectorProductos = () => mostrarSelector.value = true
const eliminarProducto = (index) => carrito.value.splice(index, 1)

async function guardarCarrito() {
  try {
    if (carrito.value.length === 0) return alert('El carrito está vacío')
    if (!proveedorSeleccionado.value) return alert('Seleccione un proveedor')
    if (!factura.value) return alert('Ingrese el número de factura')

    const employeeId = getEmployeeIdFromCookie()
    const body = {
      employeeId,
      supplierId: proveedorSeleccionado.value,
      invoiceNumber: factura.value, // Asegúrate de que tu backend reciba este campo
      items: carrito.value
        .filter(i => i.talla && i.color && i.cantidad)
        .map(i => {
          // Usamos el SKU ya generado en la fila
          return {
            productId: i.id,
            sku: i.sku, 
            size: i.talla,
            color: i.color,
            quantity: i.cantidad
          }
        })
    }
    const res = await fetch("http://localhost:8080/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(await res.text())
    alert('¡Reposición guardada exitosamente!')
    cancelarCarrito()
  } catch (e) { alert("Error: " + e.message) }
}
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background-color: #f0fdf4; }

.reposicion-panel {
  background-color: #f0fdf4; padding: 2rem; border-radius: 12px;
  font-family: "Inter", sans-serif; flex: 1; display: flex;
  flex-direction: column; gap: 1.5rem;
}

/* Estilos para el nuevo campo SKU */
.sku-badge {
  background-color: #e2e8f0;
  color: #475569;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 0.85rem;
  border: 1px solid #cbd5e1;
}

.sku-placeholder {
  color: #94a3b8;
  font-size: 0.8rem;
  font-style: italic;
}

/* ... Resto de tus estilos originales ... */
h2 { font-size: 1.5rem; color: #166534; margin-bottom: 0.5rem; text-align: center; }
.top-actions { display: flex; flex-direction: column; gap: 1rem; }
.tasa-info { text-align: left; font-size: 1.1rem; color: #065f46; background-color: #d1fae5; padding: 0.6rem 1rem; border-radius: 8px; border-left: 4px solid #10b981; width: fit-content; }
.proveedor-info { display: flex; align-items: flex-end; gap: 1.5rem; background-color: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #a7f3d0; }
.btn-derecha { margin-left: auto; }
.input-group { display: flex; flex-direction: column; gap: 0.3rem; }
.input-group label { font-size: 0.85rem; font-weight: 700; color: #065f46; }
.input-readonly { background-color: #f9fafb !important; color: #6b7280 !important; cursor: not-allowed; border: 1px solid #e5e7eb !important; }
.tabla-productos { width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.tabla-productos th { background-color: #ecfdf5; padding: 0.85rem; color: #065f46; font-weight: 700; text-align: left; }
.tabla-productos td { padding: 0.85rem; border-bottom: 1px solid #a7f3d0; color: #065f46; }
.nombre-producto { font-weight: 600; color: #111827; }
.subtexto-marca { font-size: 0.75rem; color: #6b7280; }
.col-precio-dual { min-width: 120px; }
.bs-price { font-size: 1rem; color: #111827; }
.usd-price { font-size: 0.85rem; color: #10b981; font-weight: 600; }
.input-cantidad { width: 70px; text-align: center; padding: 0.4rem; border-radius: 6px; border: 1px solid #a7f3d0; }
.select-table { padding: 0.3rem; border-radius: 6px; border: 1px solid #a7f3d0; font-size: 0.9rem; background: #fff; }
.total-pagar-dual { text-align: right; padding: 1rem; background-color: #ffffff; border-radius: 8px; border: 1px solid #a7f3d0; }
.total-label { font-size: 0.9rem; color: #6b7280; margin-bottom: 0.2rem; }
.monto-bs { font-size: 1.4rem; color: #166534; font-weight: 700; }
.monto-usd { font-size: 1.2rem; color: #10b981; font-weight: 700; }
.bottom-actions-container { display: flex; justify-content: flex-end; gap: 12px; margin-top: 1rem; }
button { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
button.guardar { background-color: #10b981; color: white; }
button.secundario { background-color: #d1fae5; color: #065f46; }
button.cancelar { background-color: #f3f4f6; color: #374151; }
button.btn-eliminar { background-color: #fee2e2; color: #b91c1c; padding: 0; width: 30px; height: 30px; border-radius: 50%; font-size: 1.2rem; }
button:hover:not(:disabled) { filter: brightness(0.9); }
button:disabled { opacity: 0.5; cursor: not-allowed; }
select, input[type="text"], input[type="number"] { padding: 0.5rem; border-radius: 6px; border: 1px solid #a7f3d0; outline: none; font-family: inherit; }
</style>
