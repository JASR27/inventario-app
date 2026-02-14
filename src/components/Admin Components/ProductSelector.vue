<template>
  <div class="selector-panel">
    <div class="header-container">
      <h2 class="titulo-naranja">Seleccionar Producto</h2>
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

// Lógica de SKU: 3 letras nombre (Mayus) + ID
function generarSku(nombre, id) {
  const prefijo = (nombre || 'PRO').substring(0, 3).toUpperCase();
  return `${prefijo}-${id}`;
}

function formatearNumero(v) {
  return (parseFloat(v) || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatoBs(v) { return 'Bs ' + formatearNumero(v); }

async function fetchTasa() {
  try {
    const res = await fetch('http://localhost:8080/currency/exchange_rate')
    if (res.ok) tasaCambio.value = parseFloat(await res.text())
  } catch (e) { console.error(e) }
}

async function fetchProductos() {
  try {
    const response = await fetch('http://localhost:8080/product')
    if (!response.ok) throw new Error('Error al cargar productos')
    const data = await response.json()
    
    // Generamos el SKU para todos los productos recibidos
    const listaConSku = data.map(p => ({
      ...p,
      sku: generarSku(p.name, p.id)
    }))

    if (props.modo === 'venta') {
      const promesas = listaConSku.map(async (p) => {
        try {
          const detResp = await fetch(`http://localhost:8080/product/detail/${p.id}`)
          const detalle = await detResp.json()
          const variantes = Array.isArray(detalle) ? detalle : (detalle.value || [])
          const totalStock = variantes.reduce((acc, v) => acc + (v.stock || 0), 0)
          return totalStock >= 1 ? p : null
        } catch { return null }
      })
      productos.value = (await Promise.all(promesas)).filter(p => p !== null)
    } else {
      productos.value = listaConSku
    }
  } catch (e) { console.error(e) }
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

function seleccionar(p) { emit('seleccionar', p) }
onMounted(() => { fetchTasa(); fetchProductos(); })
</script>

<style scoped>
.selector-panel {
  background-color: #fff7ed;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(154, 52, 18, 0.1);
  font-family: "Inter", sans-serif;
  max-width: 1050px;
  margin: 2vh auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  border: 1px solid #fdba74;
}

.header-container { text-align: center; }

.titulo-naranja {
  color: #9a3412;
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
}

.tasa-header {
  display: inline-block;
  background-color: #f97316;
  color: white;
  padding: 0.4rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  flex-wrap: wrap;
  gap: 1rem;
}

.control-group { display: flex; align-items: center; gap: 0.6rem; }
.control-group label { color: #9a3412; font-weight: 600; font-size: 0.85rem; }

.select-input, .search-input {
  padding: 0.5rem;
  border: 1px solid #fdba74;
  border-radius: 6px;
  outline: none;
  color: #431407;
}

.btn-orden {
  background-color: #f97316;
  color: white;
  border: none;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.table-container {
  max-height: 380px;
  overflow-y: auto;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  background: white;
}

table { width: 100%; border-collapse: collapse; }
thead { position: sticky; top: 0; background: #ffedd5; z-index: 10; }
th { padding: 0.8rem 1rem; text-align: left; color: #9a3412; border-bottom: 2px solid #fdba74; }
td { padding: 0.8rem 1rem; border-bottom: 1px solid #fff7ed; color: #431407; }

.col-sku { font-family: monospace; font-weight: 700; color: #c2410c; }
.col-nombre { font-weight: 600; }
.col-simple { font-size: 0.9rem; }

.col-precio-dual { text-align: right; }
.precio-usd { font-weight: 800; color: #1e293b; }
.precio-bs { color: #f97316; font-size: 0.75rem; font-weight: 700; }

tr:hover { background-color: #fff7ed; cursor: pointer; }

.no-results { text-align: center; padding: 2rem; color: #9a3412; font-style: italic; opacity: 0.6; }

.footer-actions { display: flex; justify-content: flex-end; }

.btn-cerrar {
  padding: 0.7rem 2rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
}
</style>