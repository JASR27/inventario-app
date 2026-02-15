<template>
  <div class="selector-panel">
    <div class="header-container">
      <h2 class="titulo-verde">Seleccionar Producto</h2>
      <div class="tasa-header" v-if="tasaCambio > 0">
        <span class="tasa-label">Tasa del día:</span>
        <span class="tasa-valor">1$ = {{ formatoBs(tasaCambio) }}</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="control-group">
        <label>Buscar por:</label>
        <select v-model="campoBusqueda" class="select-input">
          <option value="todos">Todos los campos</option>
          <option value="sku">SKU</option>
          <option value="name">Nombre</option>
          <option value="description">Descripción</option>
          <option value="brand">Marca</option>
        </select>
        <input
          type="text"
          v-model="busqueda"
          :placeholder="placeholderBusqueda"
          class="search-input"
        />
      </div>

      <div class="control-group">
        <label>Ordenar por:</label>
        <select v-model="criterioOrden" class="select-input">
          <option value="sku">SKU</option>
          <option value="name">Nombre</option>
          <option value="brand">Marca</option>
          <option value="price">Precio</option>
        </select>
        <button @click="ordenAscendente = !ordenAscendente" class="btn-orden">
          {{ ordenAscendente ? 'Ascendente ▲' : 'Descendente ▼' }}
        </button>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Marca</th>
            <th v-if="modo === 'venta'">Precio Venta</th>
            <th v-else>Precio Compra</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="producto in productosFiltradosYOrdenados" 
            :key="producto.id" 
            @click="seleccionar(producto)"
          >
            <td class="col-sku">{{ producto.sku }}</td>
            <td class="col-nombre">{{ producto.name }}</td>
            <td class="col-simple">{{ producto.description }}</td>
            <td class="col-simple">{{ producto.brand?.name || 'S/M' }}</td>
            <td class="col-precio-dual">
              <div class="precio-usd">
                {{ formatearNumero(modo === 'venta' ? producto.sellingPrice : producto.buyingPrice) }}$
              </div>
              <div class="precio-bs">
                {{ formatoBs((Number(modo === 'venta' ? producto.sellingPrice : producto.buyingPrice || 0)) * (tasaCambio || 1)) }}
              </div>
            </td>
          </tr>
          <tr v-if="productosFiltradosYOrdenados.length === 0">
            <td colspan="6" class="no-results">
              {{ productos.length === 0 ? 'Cargando productos...' : 'No se encontraron coincidencias' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer-actions">
      <button type="button" class="btn-cerrar" @click="$emit('cerrar')">Cerrar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '../../store/useNotificationStore.js'; // Importación del store

const notificationStore = useNotificationStore();
const emit = defineEmits(['seleccionar', 'cerrar'])
const props = defineProps({
  modo: { type: String, default: 'venta' },
})

const productos = ref([])
const busqueda = ref('')
const campoBusqueda = ref('todos')
const criterioOrden = ref('sku')
const ordenAscendente = ref(true)
const tasaCambio = ref(0)

// Helper para generar SKU
function generarSku(nombre, id) {
  if (!nombre) return `PRO-${id}`;
  const prefijo = nombre.substring(0, 3).toUpperCase();
  return `${prefijo}-${id}`;
}

function formatearNumero(v) {
  return (parseFloat(v) || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatoBs(v) { return 'Bs ' + formatearNumero(v); }

async function fetchTasa() {
  try {
    const res = await fetch('http://localhost:8080/currency/exchange_rate')
    if (res.ok) {
      tasaCambio.value = parseFloat(await res.text())
    } else {
      notificationStore.addNotification("Aviso", "No se pudo obtener la tasa de cambio actual.", "info")
    }
  } catch (e) { 
    console.error(e)
  }
}

async function fetchProductos() {
  try {
    const response = await fetch('http://localhost:8080/product')
    if (!response.ok) throw new Error("Error en servidor");
    
    const data = await response.json()
    
    let listaProcesada = data.map(p => ({
      ...p,
      sku: generarSku(p.name, p.id)
    }));

    if (props.modo === 'venta') {
      const promesas = listaProcesada.map(async (p) => {
        try {
          const det = await fetch(`http://localhost:8080/product/detail/${p.id}`).then(r => r.json())
          const stockItems = det.value || (Array.isArray(det) ? det : [])
          const totalStock = stockItems.reduce((acc, v) => acc + (v.stock || 0), 0)
          return totalStock >= 1 ? p : null
        } catch { return null }
      })
      const filtrados = (await Promise.all(promesas)).filter(p => p !== null)
      
      if (filtrados.length === 0 && listaProcesada.length > 0) {
        notificationStore.addNotification("Inventario", "No hay productos con stock disponible para la venta.", "info")
      }
      productos.value = filtrados
    } else {
      productos.value = listaProcesada
    }
  } catch (e) { 
    notificationStore.addNotification("Error", "No se pudo conectar con el catálogo de productos.", "error")
  }
}

const placeholderBusqueda = computed(() => {
  const ops = { todos: 'Buscar...', sku: 'Ej: ACE-10...', name: 'Nombre...', description: 'Descripción...', brand: 'Marca...' }
  return ops[campoBusqueda.value]
})

const productosFiltradosYOrdenados = computed(() => {
  let filtrados = productos.value.filter(p => {
    const texto = busqueda.value.toLowerCase().trim()
    if (!texto) return true
    const matchSKU = (p.sku || '').toLowerCase().includes(texto)
    const matchN = (p.name || '').toLowerCase().includes(texto)
    const matchD = (p.description || '').toLowerCase().includes(texto)
    const matchB = (p.brand?.name || '').toLowerCase().includes(texto)
    
    if (campoBusqueda.value === 'sku') return matchSKU
    if (campoBusqueda.value === 'name') return matchN
    if (campoBusqueda.value === 'description') return matchD
    if (campoBusqueda.value === 'brand') return matchB
    return matchSKU || matchN || matchD || matchB
  })

  filtrados.sort((a, b) => {
    let vA, vB
    if (criterioOrden.value === 'price') {
      vA = props.modo === 'venta' ? (a.sellingPrice || 0) : (a.buyingPrice || 0)
      vB = props.modo === 'venta' ? (b.sellingPrice || 0) : (b.buyingPrice || 0)
      return ordenAscendente.value ? vA - vB : vB - vA
    }
    
    vA = (p => {
      if (criterioOrden.value === 'sku') return p.sku || ''
      if (criterioOrden.value === 'brand') return p.brand?.name || ''
      return p.name || ''
    })(a).toLowerCase()
    
    vB = (p => {
      if (criterioOrden.value === 'sku') return p.sku || ''
      if (criterioOrden.value === 'brand') return p.brand?.name || ''
      return p.name || ''
    })(b).toLowerCase()

    return ordenAscendente.value ? vA.localeCompare(vB) : vB.localeCompare(vA)
  })
  return filtrados
})

function seleccionar(p) { 
  notificationStore.addNotification("Seleccionado", `${p.name} añadido correctamente.`, "success")
  emit('seleccionar', p) 
}

onMounted(() => { 
  fetchTasa(); 
  fetchProductos(); 
})
</script>

<style scoped>
/* (Estilos idénticos al anterior, con la columna col-sku resaltada) */
.selector-panel { background-color: #f0fdf4; padding: 1.5rem 2rem; border-radius: 12px; font-family: "Inter", sans-serif; max-width: 1050px; margin: 2vh auto; display: flex; flex-direction: column; gap: 1.2rem; }
.header-container { text-align: center; }
.titulo-verde { color: #166534; font-size: 1.6rem; margin-bottom: 0.5rem; }
.tasa-header { display: inline-block; background-color: #10b981; color: white; padding: 0.4rem 1.2rem; border-radius: 20px; font-size: 0.9rem; }
.toolbar { display: flex; justify-content: space-between; background: #fff; padding: 1rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); flex-wrap: wrap; }
.control-group { display: flex; align-items: center; gap: 0.6rem; }
.select-input, .search-input { padding: 0.5rem; border: 1px solid #a7f3d0; border-radius: 6px; outline: none; margin-right: 15px;}
.btn-orden { background-color: #10b981; color: white; border: none; padding: 0.5rem 0.8rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
.table-container { max-height: 380px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: white; }
table { width: 100%; border-collapse: collapse; }
thead { position: sticky; top: 0; background: #d1fae5; color: #065f46; z-index: 10; }
th, td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid #f1f5f9; }
.col-sku { font-family: 'Courier New', Courier, monospace; font-weight: bold; color: #000; background: #f0fdf4; }
.col-nombre { font-weight: 600; color: #111827; }
.col-simple { color: #374151; font-size: 0.9rem; }
.col-precio-dual { text-align: right; }
.precio-usd { font-weight: 700; color: #1e293b; }
.precio-bs { color: #10b981; font-size: 0.75rem; font-weight: 600; }
tr:hover { background-color: #f0fdf4; cursor: pointer; }
.footer-actions { display: flex; justify-content: flex-end; }
.btn-cerrar { padding: 0.7rem 2rem; background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; color: #374151; font-weight: 600; cursor: pointer; }
</style>