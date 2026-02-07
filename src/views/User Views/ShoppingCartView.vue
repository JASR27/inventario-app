<template>
  <div class="layout">
    <Sidebar />

    <div class="carrito-panel" v-if="!mostrarSelector && !mostrarPago && !mostrarPagos && !mostrarCliente">
      <h2>Carrito de Compras</h2>

      <div class="top-actions">
        <div class="tasa-info" v-if="tasaCambio > 0">
          <small>Tasa del día: <strong>1$ = {{ formatoBs(tasaCambio) }}</strong></small>
        </div>

        <div class="cliente-info-box">
          <div class="cliente-detalles">
            <template v-if="clienteSeleccionado">
              <div class="info-item"><strong>Cliente:</strong> {{ clienteSeleccionado.fullName }}</div>
              <div class="info-item"><strong>NID:</strong> {{ clienteSeleccionado.nid }}</div>
            </template>
            <template v-else>
              <div class="info-item placeholder"><strong>Cliente:</strong> Por seleccionar</div>
              <div class="info-item placeholder"><strong>NID:</strong> ---</div>
            </template>
          </div>
          <button class="secundario" @click="mostrarSelectorCliente">
            {{ clienteSeleccionado ? 'Cambiar Cliente' : 'Seleccionar Cliente' }}
          </button>
          
          <button class="secundario btn-derecha" @click="mostrarSelectorProductos">Agregar Producto</button>
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
            <th>Precio Unit.</th>
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
              <select v-model="item.color" @change="seleccionarColor(item)" class="select-table">
                <option disabled :value="null">Color</option>
                <option v-for="c in item.colores" :key="c" :value="c">{{ c }}</option>
              </select>
            </td>
            <td>
              <select v-model="item.talla" @change="seleccionarTalla(item)" :disabled="!item.color" class="select-table">
                <option disabled :value="null">Talla</option>
                <option v-for="t in item.tallasDisponibles" :key="t" :value="t">{{ t }}</option>
              </select>
            </td>
            <td>
              <span class="sku-badge" v-if="item.sku">{{ item.sku }}</span>
              <span class="sku-placeholder" v-else>Pendiente...</span>
            </td>
            <td>
              <select v-model="item.cantidad" :disabled="!item.talla" class="select-table">
                <option disabled :value="null">Cant.</option>
                <option v-for="n in item.cantidades" :key="n" :value="n">{{ n }}</option>
              </select>
            </td>
            <td class="col-precio-dual">
              <div class="bs-price"><strong>{{ item.sellingPrice.toFixed(2) }}$</strong></div>
              <div class="usd-price" v-if="tasaCambio > 0">{{ formatoBs(item.sellingPrice * tasaCambio) }}</div>
            </td>
            <td class="col-precio-dual">
              <div class="bs-price"><strong>{{ (item.sellingPrice * (item.cantidad || 0)).toFixed(2) }}$</strong></div>
              <div class="usd-price" v-if="tasaCambio > 0">
                {{ formatoBs(item.sellingPrice * (item.cantidad || 0) * tasaCambio) }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="resumen-pago-dual">
        <div class="pago-col">
          <div class="total-label">Total Venta:</div>
          <div class="total-monto">
            <span class="monto-primario">{{ totalGeneralUSD.toFixed(2) }}$</span>
            <span class="monto-secundario" v-if="tasaCambio > 0"> / {{ formatoBs(totalGeneralUSD * tasaCambio) }}</span>
          </div>
        </div>
        <div class="pago-col separator">
          <div class="total-label">Pagado (Bs):</div>
          <div class="total-monto">
            <span class="monto-primario bs">{{ formatoBs(totalPagado) }}</span>
          </div>
        </div>
        <div class="pago-col">
          <div class="total-label">{{ diferencia > 0.01 ? 'Falta (Bs):' : 'Cambio (Bs):' }}</div>
          <div class="total-monto" :class="diferencia > 0.01 ? 'texto-rojo' : 'texto-verde'">
            {{ formatoBs(Math.abs(diferencia)) }}
          </div>
        </div>
      </div>

      <div class="bottom-actions-container">
        <button class="secundario" @click="mostrarFormularioPago">Agregar Pago</button>
        <button class="secundario" @click="mostrarListaPagos">Ver Pagos ({{ pagos.length }})</button>
        <button class="cancelar" @click="cancelarCarrito">Cancelar</button>
        <button class="guardar" @click="guardarCarrito" :disabled="carrito.length === 0">Confirmar Venta</button>
      </div>
    </div>

    <ProductSelector v-if="mostrarSelector" modo="venta" @seleccionar="agregarProducto" @cerrar="mostrarSelector = false" />
    <PaymentForm v-if="mostrarPago" @guardar="agregarPago" @cerrar="mostrarPago = false" />
    <PaymentList v-if="mostrarPagos" :pagos="pagos" @eliminar="eliminarPago" @cerrar="mostrarPagos = false" />
    <ClientSelector v-if="mostrarCliente" @seleccionar="seleccionarCliente" @cerrar="mostrarCliente = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarUser.vue'
import ProductSelector from '../../components/User Components/ProductSelector.vue'
import PaymentForm from '../../components/User Components/PaymentForm.vue'
import PaymentList from '../../components/User Components/PaymentList.vue'
import ClientSelector from '../../components/User Components/ClientSelector.vue'

const carrito = ref([])
const pagos = ref([])
const clienteSeleccionado = ref(null)
const tasaCambio = ref(0)
const mostrarSelector = ref(false)
const mostrarPago = ref(false)
const mostrarPagos = ref(false)
const mostrarCliente = ref(false)

onMounted(() => obtenerTasa())

async function obtenerTasa() {
  try {
    const res = await fetch('http://localhost:8080/currency/exchange_rate')
    if (res.ok) tasaCambio.value = parseFloat(await res.text())
  } catch (e) { console.error("Error tasa:", e) }
}

async function agregarProducto(producto) {
  try {
    const res = await fetch(`http://localhost:8080/product/detail/${producto.id}`)
    const data = await res.json()
    const listaVariantes = Array.isArray(data) ? data : (data.value || [])
    const variantesConStock = listaVariantes.filter(v => v.stock >= 1)
    if (variantesConStock.length === 0) return alert("Sin stock disponible.")

    carrito.value.push({
      id: producto.id,
      nombre: producto.name,
      marca: producto.brand?.name || '',
      sellingPrice: parseFloat(producto.sellingPrice),
      color: null, 
      talla: null, 
      sku: '', // Campo para el SKU dinámico
      cantidad: null, 
      productDetailId: null,
      colores: [...new Set(variantesConStock.map(v => v.color))],
      tallasDisponibles: [], 
      cantidades: [], 
      variantes: variantesConStock
    })
  } catch (e) { alert('Error cargando producto.') }
  mostrarSelector.value = false
}

// Función para generar el SKU basado en tu requerimiento
function generarSKU(item) {
  if (!item.color || !item.talla) {
    item.sku = '';
    return;
  }
  const prefijo = item.nombre.substring(0, 3).toUpperCase();
  item.sku = `${prefijo}-${item.id}-${item.talla}-${item.color.toUpperCase()}`;
}

function seleccionarColor(item) {
  item.talla = null; 
  item.cantidad = null; 
  item.productDetailId = null;
  item.sku = ''; // Limpiar SKU hasta que seleccione talla
  const tallas = item.variantes.filter(v => v.color === item.color).map(v => v.size)
  item.tallasDisponibles = [...new Set(tallas)].sort((a, b) => a - b)
}

function seleccionarTalla(item) {
  item.cantidad = null
  const v = item.variantes.find(v => v.color === item.color && v.size === item.talla)
  if (v) {
    item.cantidades = Array.from({ length: v.stock }, (_, i) => i + 1)
    item.productDetailId = v.id
    generarSKU(item); // Generar SKU al tener talla y color
  }
}

const totalGeneralUSD = computed(() => carrito.value.reduce((acc, i) => acc + (i.sellingPrice * (i.cantidad || 0)), 0))
const totalGeneralBS = computed(() => totalGeneralUSD.value * tasaCambio.value)
const totalPagado = computed(() => pagos.value.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0))
const diferencia = computed(() => totalGeneralBS.value - totalPagado.value)

function formatoBs(v) {
  return 'Bs ' + parseFloat(v || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
}

function getEmployeeIdFromCookie() {
  const match = document.cookie.match(/userid=(\d+)/)
  return match ? parseInt(match[1]) : null
}

function cancelarCarrito() { carrito.value = []; pagos.value = []; clienteSeleccionado.value = null; }
const agregarPago = (p) => pagos.value.push(p)
const eliminarPago = (i) => pagos.value.splice(i, 1)
const eliminarProducto = (i) => carrito.value.splice(i, 1)
const mostrarSelectorProductos = () => mostrarSelector.value = true
const mostrarFormularioPago = () => mostrarPago.value = true
const mostrarListaPagos = () => mostrarPagos.value = true
const mostrarSelectorCliente = () => mostrarCliente.value = true
const seleccionarCliente = (c) => { clienteSeleccionado.value = c; mostrarCliente.value = false; }

async function guardarCarrito() {
  try {
    if (carrito.value.length === 0 || !clienteSeleccionado.value) return alert('Seleccione cliente y productos')
    if (totalPagado.value < (totalGeneralBS.value - 0.01)) return alert('Pago insuficiente')

    const body = {
      employeeId: getEmployeeIdFromCookie(),
      clientId: clienteSeleccionado.value.id,
      items: carrito.value.map(i => ({ productDetailId: i.productDetailId, quantity: i.cantidad })),
      payments: pagos.value.map(p => ({ method: p.method, amount: p.amount.toString() }))
    }

    const res = await fetch("http://localhost:8080/sale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(await res.text())
    alert('¡Venta exitosa!'); cancelarCarrito()
  } catch (e) { alert("Error: " + e.message) }
}
</script>

<style scoped>
/* ... Mantener estilos anteriores ... */
.layout { display: flex; min-height: 100vh; background-color: #f0fdf4; }
.carrito-panel {
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
.cliente-info-box { display: flex; align-items: center; gap: 1.5rem; background-color: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #a7f3d0; }
.cliente-detalles { flex-grow: 0; min-width: 250px; }
.info-item { font-size: 0.95rem; color: #065f46; line-height: 1.4; }
.info-item.placeholder { color: #94a3b8; font-style: italic; }
.btn-derecha { margin-left: auto; }
.tabla-productos { width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.tabla-productos th { background-color: #ecfdf5; padding: 0.85rem; color: #065f46; font-weight: 700; text-align: left; }
.tabla-productos td { padding: 0.85rem; border-bottom: 1px solid #a7f3d0; color: #065f46; }
.nombre-producto { font-weight: 600; color: #111827; }
.subtexto-marca { font-size: 0.75rem; color: #6b7280; }
.col-precio-dual { min-width: 130px; }
.bs-price { font-size: 1rem; color: #111827; }
.usd-price { font-size: 0.85rem; color: #10b981; font-weight: 600; }
.select-table { padding: 0.3rem; border-radius: 6px; border: 1px solid #a7f3d0; font-size: 0.9rem; background: #fff; }
.resumen-pago-dual { display: flex; justify-content: flex-end; gap: 2rem; padding: 1rem 1.5rem; background-color: #ffffff; border-radius: 8px; border: 1px solid #a7f3d0; text-align: right; }
.pago-col { display: flex; flex-direction: column; }
.separator { padding-right: 2rem; border-right: 1px solid #e2e8f0; }
.total-label { font-size: 0.85rem; color: #6b7280; margin-bottom: 0.2rem; font-weight: 600; }
.monto-primario { font-size: 1.3rem; color: #166534; font-weight: 700; }
.monto-primario.bs { color: #111827; }
.monto-secundario { font-size: 1.1rem; color: #10b981; font-weight: 600; }
.texto-rojo { color: #dc2626; font-weight: 700; font-size: 1.3rem; }
.texto-verde { color: #10b981; font-weight: 700; font-size: 1.3rem; }
.bottom-actions-container { display: flex; justify-content: flex-end; gap: 12px; margin-top: 1rem; }
button { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
button.guardar { background-color: #10b981; color: white; }
button.secundario { background-color: #d1fae5; color: #065f46; }
button.cancelar { background-color: #f3f4f6; color: #374151; }
button.btn-eliminar { background-color: #fee2e2; color: #b91c1c; padding: 0; width: 30px; height: 30px; border-radius: 50%; font-size: 1.2rem; }
button:hover:not(:disabled) { filter: brightness(0.9); }
button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>