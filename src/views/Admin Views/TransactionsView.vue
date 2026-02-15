<template>
  <div class="layout">
    <Sidebar />

    <div v-if="!mostrarDetalle" class="transacciones-panel">
      <h2 class="titulo-central">Historial de {{ labelPlural }}</h2>

      <div class="toolbar-tabla">
        <div class="control-group">
          <label>Tipo:</label>
          <select v-model="tipoFiltro" class="select-input-toolbar" @change="fetchDatos">
            <option value="sale">Ventas</option>
            <option value="purchase">Reposiciones</option>
            <option value="devolution">Devoluciones</option>
            <option value="entry_adjustment">Ajustes Entrada (+)</option>
            <option value="exit_adjustment">Ajustes Salida (-)</option>
          </select>
        </div>

        <div class="control-group">
          <label>Buscar por:</label>
          <select v-model="campoBusqueda" class="select-input-toolbar">
            <option value="todos">Todos</option>
            <option value="fecha">Fecha</option>
            <option value="sujeto">{{ labelSujeto }}</option>
            <option value="empleado">Responsable</option>

          </select>
          <input type="text" v-model="busqueda" placeholder="Buscar..." class="search-input-toolbar" />
        </div>

        <div class="control-group">
          <label>Ordenar:</label>
          <select v-model="criterioOrden" class="select-input-toolbar">
            <option value="createdAt">Fecha</option>
            <option value="sujeto">{{ labelSujeto }}</option>
            <option value="itemsCount">Cant. Items</option>
          </select>
          <button @click="ordenAscendente = !ordenAscendente" class="btn-orden-tabla">
            {{ ordenAscendente ? 'Ascendente ▲' : 'Descendente ▼' }}
          </button>
        </div>
      </div>

      <div class="tabla-contenedor">
        <table class="tabla-elegante">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>{{ labelSujeto }}</th>
              <th>Responsable</th>
              <th class="text-center">Items</th>
              <th class="text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in transaccionesFiltradas" :key="t.id">
              <td>{{ formatoFecha(t.createdAt) }}</td>
              <td class="font-bold">{{ obtenerSujeto(t) }}</td>
              <td>{{ t.employee.firstName }} {{ t.employee.lastName }}</td>
              <td class="text-center">
                <span class="count-bubble">{{ totalProductos(t.items) }}</span>
              </td>
              <td class="text-right">
                <button class="btn-ver" @click="verDetalle(t)">Ver detalles</button>
              </td>
            </tr>
            <tr v-if="transaccionesFiltradas.length === 0">
              <td colspan="5" class="text-center" style="padding: 2rem; color: #9a3412;">
                No se encontraron resultados para tu búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="transacciones-detalle">
      <h2 class="titulo-central">Detalle de {{ labelSingular }}</h2>

      <div class="info-grid">
        <div class="info-card">
          <div class="card-header">Datos Generales</div>
          <div class="card-body">
            <p><span>Fecha:</span> {{ formatoFecha(transaccionSeleccionada.createdAt) }}</p>
            <p><span>Empleado:</span> {{ transaccionSeleccionada.employee.firstName }} {{
              transaccionSeleccionada.employee.lastName }}</p>
            <p v-if="transaccionSeleccionada.reason"><span>Motivo:</span> {{ transaccionSeleccionada.reason }}</p>
          </div>
        </div>

        <div class="info-card" v-if="transaccionSeleccionada.client || transaccionSeleccionada.supplier">
          <div class="card-header">{{ transaccionSeleccionada.client ? 'Cliente' : 'Proveedor' }}</div>
          <div class="card-body">
            <p><span>Nombre:</span> {{ transaccionSeleccionada.client?.fullName ||
              transaccionSeleccionada.supplier?.name }}</p>
            <p><span>Documento:</span> {{ transaccionSeleccionada.client?.nid || transaccionSeleccionada.supplier?.nid
              }}</p>

            <p v-if="transaccionSeleccionada.client?.address">
              <span>Dirección:</span> {{ transaccionSeleccionada.client.address }}
            </p>

            <p v-if="transaccionSeleccionada.bill">
              <span>Nro. Factura:</span>
              <strong style="color: #f97316;">{{ transaccionSeleccionada.bill }}</strong>
            </p>
          </div>
        </div>
      </div>

      <h3 class="subtitulo">Productos en la Operación</h3>
      <div class="tabla-contenedor">
        <table class="tabla-productos-detalle">
          <thead>
            <tr>
              <th>SKU / Referencia</th>
              <th>Especificaciones</th>
              <th class="text-center">Cantidad</th>
              <th v-if="tieneMonto" class="text-right">Precio Unit.</th>
              <th v-if="tieneMonto" class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in transaccionSeleccionada.items" :key="item.id">
              <td><code class="sku-code">{{ item.productDetail.sku }}</code></td>
              <td>
                <span class="espec-tag">{{ item.productDetail.color }}</span>
                <span class="espec-tag">{{ item.productDetail.size }}</span>
              </td>
              <td class="text-center font-bold" :class="item.quantity < 0 ? 'cant-negativa' : 'cant-positiva'">
                {{ item.quantity > 0 ? '+' : '' }}{{ item.quantity }}
              </td>
              <td v-if="tieneMonto" class="text-right">{{ formato(item.amount) }}</td>
              <td v-if="tieneMonto" class="text-right font-bold">{{ formato(item.amount * Math.abs(item.quantity)) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="transaccionSeleccionada.payments?.length" class="pagos-resumen">
        <h3 class="subtitulo">Resumen de Pago</h3>
        <div class="pagos-lista">
          <div v-for="pago in transaccionSeleccionada.payments" :key="pago.id" class="pago-item">
            <span class="metodo">{{ pago.method }}</span>
            <span class="monto">{{ formato(pago.amount) }}</span>
          </div>
        </div>
      </div>

      <div class="acciones-footer">
        <button class="btn-volver" @click="volverLista">Volver al listado</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarAdmin.vue'
import { useNotificationStore } from '../../store/useNotificationStore.js'

const notificationStore = useNotificationStore()

const transacciones = ref([])
const busqueda = ref('')
const tipoFiltro = ref('sale')
const mostrarDetalle = ref(false)
const transaccionSeleccionada = ref(null)
const campoBusqueda = ref('todos')
const criterioOrden = ref('createdAt')
const ordenAscendente = ref(false)

// Labels dinámicos
const labelSingular = computed(() => ({ sale: 'Venta', purchase: 'Reposición', devolution: 'Devolución', entry_adjustment: 'Ajuste de Entrada', exit_adjustment: 'Ajuste de Salida' }[tipoFiltro.value]))
const labelPlural = computed(() => ({ sale: 'Ventas', purchase: 'Reposiciones', devolution: 'Devoluciones', entry_adjustment: 'Ajustes de Entrada', exit_adjustment: 'Ajustes de Salida' }[tipoFiltro.value]))
const labelSujeto = computed(() => (['sale', 'devolution'].includes(tipoFiltro.value)) ? 'Cliente' : (tipoFiltro.value === 'purchase' ? 'Proveedor' : 'Motivo'))
const tieneMonto = computed(() => !tipoFiltro.value.includes('adjustment'))

// Función de carga de datos con Notificaciones
async function fetchDatos() {
  let endpoint = tipoFiltro.value.includes('adjustment') ? 'adjustment' : tipoFiltro.value
  try {
    const res = await fetch(`http://localhost:8080/${endpoint}`)
    if (!res.ok) throw new Error(`Error ${res.status}`)

    const data = await res.json()
    let lista = Array.isArray(data) ? data : []

    if (tipoFiltro.value === 'entry_adjustment') lista = lista.filter(t => t.items.some(i => i.quantity > 0))
    if (tipoFiltro.value === 'exit_adjustment') lista = lista.filter(t => t.items.some(i => i.quantity < 0))

    transacciones.value = lista
  } catch (e) {
    transacciones.value = []
    notificationStore.addNotification(
      "Error de Conexión",
      `No se pudo obtener el historial de ${labelPlural.value.toLowerCase()}.`,
      "error"
    )
  }
}

// BÚSQUEDA Y ORDENAMIENTO
const transaccionesFiltradas = computed(() => {
  let resultado = transacciones.value.filter(t => {
    const q = busqueda.value.toLowerCase().trim()
    if (!q) return true

    const fFecha = formatoFecha(t.createdAt).toLowerCase().includes(q)
    const fSujeto = obtenerSujeto(t).toLowerCase().includes(q)
    const fEmpleado = `${t.employee?.firstName || ''} ${t.employee?.lastName || ''}`.toLowerCase().includes(q)
    const fSku = (t.items || []).some(i => i.productDetail?.sku?.toLowerCase().includes(q))

    if (campoBusqueda.value === 'fecha') return fFecha
    if (campoBusqueda.value === 'sujeto') return fSujeto
    if (campoBusqueda.value === 'empleado') return fEmpleado
    if (campoBusqueda.value === 'sku') return fSku
    return fFecha || fSujeto || fEmpleado || fSku
  })

  resultado.sort((a, b) => {
    let aVal, bVal
    if (criterioOrden.value === 'createdAt') {
      aVal = new Date(a.createdAt).getTime()
      bVal = new Date(b.createdAt).getTime()
    } else if (criterioOrden.value === 'sujeto') {
      aVal = obtenerSujeto(a).toLowerCase()
      bVal = obtenerSujeto(b).toLowerCase()
    } else {
      aVal = totalProductos(a.items)
      bVal = totalProductos(b.items)
    }

    const res = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return ordenAscendente.value ? res : -res
  })

  return resultado
})

const obtenerSujeto = (t) => t.client?.fullName || t.supplier?.name || t.reason || 'N/A'
const formato = (v) => '$' + parseFloat(v).toFixed(2)
const formatoFecha = (ts) => new Date(ts).toLocaleString()
const totalProductos = (items) => items.reduce((acc, i) => acc + Math.abs(i.quantity), 0)

const verDetalle = (t) => {
  transaccionSeleccionada.value = t;
  mostrarDetalle.value = true;
}

const volverLista = () => {
  mostrarDetalle.value = false;
}

onMounted(fetchDatos)
</script>

<style scoped>
/* Configuración Global Naranja */
:root {
  --orange-primary: #f97316;
  --orange-dark: #7c2d12;
  --orange-light: #fff7ed;
  --orange-border: #fdba74;
}

.layout {
  display: flex;
  min-height: 100vh;
  background-color: #fffaf0;
  font-family: 'Inter', sans-serif;
}

.transacciones-panel,
.transacciones-detalle {
  flex: 1;
  padding: 0;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

.titulo-central {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #7c2d12;
  margin-bottom: 1rem;
  letter-spacing: 1px;
}

.subtitulo {
  color: #9a3412;
  margin-top: 0.5rem;
  border-left: 4px solid #f97316;
  padding-left: 10px;
  font-weight: 600;
}

/* Controles */
.toolbar-tabla {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background-color: #fdfdfd;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-input-toolbar,
.search-input-toolbar {
  padding: 0.5rem;
  border: 1px solid #fdba74;
  border-radius: 6px;
  background: white;
}

.btn-orden-tabla {
  background-color: #f97316;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.control-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #9a3412;
}

.select-wrapper,
.search-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.select-wrapper label,
.search-wrapper label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #9a3412;
}

.filter-select,
.search-input {
  padding: 0.75rem;
  border: 1px solid #fdba74;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.filter-select:focus,
.search-input:focus {
  border-color: #f97316;
  outline: none;
  box-shadow: 0 0 0 3px #ffedd5;
}

/* Tablas */
.tabla-contenedor {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(124, 45, 18, 0.08);
  border: 1px solid #fdba74;
}

.tabla-elegante,
.tabla-productos-detalle {
  width: 100%;
  border-collapse: collapse;
}

.tabla-elegante thead {
  background-color: #fdba74;
  color: #7c2d12;
}

.tabla-productos-detalle thead {
  background-color: #fff7ed;
  color: #9a3412;
  border-bottom: 2px solid #fdba74;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #fff1e0;
}

.tabla-elegante tbody tr:hover {
  background-color: #fffaf0;
}

/* Badges e Íconos */
.count-bubble {
  background: #f97316;
  color: white;
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.85rem;
}

.sku-code {
  background-color: #e2e8f0;
  color: #475569;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.85rem;
  border: 1px solid #cbd5e1;
}

.espec-tag {
  background: #fff7ed;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-right: 4px;
  color: #c2410c;
  border: 1px solid #fdba74;
}

/* Colores de cantidades */
.cant-positiva {
  color: #15803d;
}

.cant-negativa {
  color: #b91c1c;
}

/* Info Cards */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.info-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #fdba74;
  overflow: hidden;
}

.card-header {
  background: #fdba74;
  color: #7c2d12;
  padding: 0.75rem 1rem;
  font-weight: bold;
  font-size: 0.9rem;
}

.card-body {
  padding: 1.2rem;
}

.card-body p {
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
  color: #431407;
}

.card-body span {
  font-weight: 600;
  color: #9a3412;
  width: 100px;
  display: inline-block;
}

/* Pagos */
.pagos-resumen {
  margin-top: 0.5rem;
  background: #fff7ed;
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid #fdba74;
}

.pagos-lista {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.pago-item {
  background: white;
  border: 2px solid #f97316;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  display: flex;
  gap: 10px;
}

.pago-item .metodo {
  font-weight: bold;
  color: #7c2d12;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.pago-item .monto {
  color: #f97316;
  font-weight: 800;
}

/* Botones */
.btn-ver {
  background: #f97316;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.btn-ver:hover {
  background: #ea580c;
  transform: translateY(-1px);
}

.acciones-footer {
  display: flex;
  justify-content: flex-end;
  /* Empuja el contenido a la derecha */
  margin-top: 2rem;
}

.btn-volver {
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-volver:hover {
  background-color: #e5e7eb;
  /* Un gris un poco más oscuro al pasar el mouse */
  color: #111827;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.font-bold {
  font-weight: 700;
}
</style>