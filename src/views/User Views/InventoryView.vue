<template>
  <div class="layout">
    <Sidebar />

    <div v-if="!mostrarDetalle" class="reposicion-panel">
      <h2>Inventario General</h2>

      <div class="toolbar">
        <div class="control-group">
          <label>Buscar por:</label>
          <select v-model="campoBusqueda" class="select-input">
            <option value="todos">Todos los campos</option>
            <option value="name">Nombre</option>
            <option value="brand">Marca</option>
            <option value="description">Descripción</option>
            <option value="sku">SKU</option>         
            
            
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
            <option value="name">Nombre</option>
            <option value="brand">Marca</option>
            <option value="sku">SKU</option>            
            <option value="buyingPrice">Precio Adquisición</option>
            <option value="sellingPrice">Precio Venta</option>
          </select>
          <button @click="ordenAscendente = !ordenAscendente" class="btn-orden">
            {{ ordenAscendente ? 'Ascendente ▲' : 'Descendente ▼' }}
          </button>
        </div>
      </div>

      <table class="tabla-productos">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Descripción</th>
            <th>SKU</th>
            <th>Precio de adquisición</th>
            <th>Precio de venta</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(producto, index) in productosFiltrados"
            :key="index"
            @click="verDetalle(producto)"
          >
            <td>{{ producto.name }}</td>
            <td>{{ producto.brand?.name }}</td>
            <td>{{ producto.description }}</td>
            <td class="sku-cell">{{ generarSKU(producto) }}</td>
            <td>{{ formato(producto.buyingPrice) }}</td>
            <td>{{ formato(producto.sellingPrice) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="reposicion-formulario">
      <h2>Inventario de: {{ productoSeleccionado.name }} ({{ generarSKU(productoSeleccionado) }})</h2>

      <div class="toolbar">
        <div class="control-group">
          <label>Buscar por:</label>
          <select v-model="campoBusquedaVariante" class="select-input">
            <option value="todos">Todos los campos</option>
            <option value="sku">SKU Variante</option>
            <option value="color">Color</option>
            <option value="size">Talla</option>
          </select>
          <input
            type="text"
            v-model="busquedaVariante"
            placeholder="Filtrar variantes..."
            class="search-input"
          />
        </div>

        <div class="control-group">
          <label>Ordenar por:</label>
          <select v-model="criterioOrdenVariante" class="select-input">
            <option value="sku">SKU Variante</option>
            <option value="color">Color</option>
            <option value="size">Talla</option>
            <option value="stock">Cantidad</option>
          </select>
          <button @click="ordenAscendenteVariante = !ordenAscendenteVariante" class="btn-orden">
            {{ ordenAscendenteVariante ? 'Ascendente ▲' : 'Descendente ▼' }}
          </button>
        </div>
      </div>

      <div v-if="!hayExistencias" class="no-stock-msg">
        No hay existencias para mostrar
      </div>

      <div v-else class="table-container-centered">
        <table class="tabla-productos tabla-ajustada">
          <thead>
            <tr>
              <th>SKU Variante</th>
              <th>Color</th>
              <th>Talla</th>
              <th>Cantidad disponible</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in variantesFiltradas" :key="index">
              <td class="sku-cell-small">{{ generarSKUVariante(item) }}</td>
              <td>{{ item.color }}</td>
              <td>{{ item.size }}</td>
              <td class="stock-cell">{{ item.stock }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bottom-actions">
        <button class="secundario" @click="volverLista">Volver</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarUser.vue'

// --- ESTADOS VISTA GENERAL ---
const inventario = ref([])
const busqueda = ref('')
const campoBusqueda = ref('todos')
const criterioOrden = ref('name')
const ordenAscendente = ref(true)

// --- ESTADOS VISTA DETALLADA ---
const mostrarDetalle = ref(false)
const productoSeleccionado = ref(null)
const variantes = ref([])
const busquedaVariante = ref('')
const campoBusquedaVariante = ref('todos')
const criterioOrdenVariante = ref('sku')
const ordenAscendenteVariante = ref(true)

// --- LÓGICA SKU ---
function generarSKU(producto) {
  if (!producto || !producto.name) return 'N/A'
  const prefijo = producto.name.substring(0, 3).toUpperCase()
  return `${prefijo}-${producto.id}`
}

function generarSKUVariante(variante) {
  if (!productoSeleccionado.value || !variante) return 'N/A'
  const baseSKU = generarSKU(productoSeleccionado.value)
  const talla = variante.size || '0'
  const color = (variante.color || 'UNI').toUpperCase()
  return `${baseSKU}-${talla}-${color}`
}

// --- COMPUTED FILTROS VISTA GENERAL ---
const placeholderBusqueda = computed(() => {
  const opciones = {
    sku: 'Buscar SKU...',
    name: 'Buscar nombre...',
    brand: 'Buscar marca...',
    description: 'Buscar en descripción...',
    todos: 'Buscar en todos los campos...'
  }
  return opciones[campoBusqueda.value]
})

const productosFiltrados = computed(() => {
  let filtrados = [...inventario.value]
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    filtrados = filtrados.filter(p => {
      const nombre = p.name?.toLowerCase() || ''
      const marca = p.brand?.name?.toLowerCase() || ''
      const desc = p.description?.toLowerCase() || ''
      const sku = generarSKU(p).toLowerCase()
      if (campoBusqueda.value === 'name') return nombre.includes(termino)
      if (campoBusqueda.value === 'brand') return marca.includes(termino)
      if (campoBusqueda.value === 'description') return desc.includes(termino)
      if (campoBusqueda.value === 'sku') return sku.includes(termino)
      return nombre.includes(termino) || marca.includes(termino) || desc.includes(termino) || sku.includes(termino)
    })
  }
  if (criterioOrden.value) {
    filtrados.sort((a, b) => {
      let valA, valB
      if (criterioOrden.value === 'brand') {
        valA = a.brand?.name?.toLowerCase() || ''
        valB = b.brand?.name?.toLowerCase() || ''
      } else if (criterioOrden.value === 'sku') {
        valA = generarSKU(a); valB = generarSKU(b)
      } else {
        valA = a[criterioOrden.value]; valB = b[criterioOrden.value]
      }
      const res = typeof valA === 'string' ? valA.localeCompare(valB) : valA - valB
      return ordenAscendente.value ? res : -res
    })
  }
  return filtrados
})

// --- COMPUTED FILTROS VISTA DETALLADA ---
const variantesFiltradas = computed(() => {
  let filtradas = [...variantes.value]
  if (busquedaVariante.value) {
    const termino = busquedaVariante.value.toLowerCase()
    filtradas = filtradas.filter(v => {
      const color = v.color?.toLowerCase() || ''
      const talla = v.size?.toString().toLowerCase() || ''
      const skuVar = generarSKUVariante(v).toLowerCase()
      
      if (campoBusquedaVariante.value === 'color') return color.includes(termino)
      if (campoBusquedaVariante.value === 'size') return talla.includes(termino)
      if (campoBusquedaVariante.value === 'sku') return skuVar.includes(termino)
      return color.includes(termino) || talla.includes(termino) || skuVar.includes(termino)
    })
  }
  if (criterioOrdenVariante.value) {
    filtradas.sort((a, b) => {
      let valA, valB
      if (criterioOrdenVariante.value === 'sku') {
        valA = generarSKUVariante(a); valB = generarSKUVariante(b)
      } else {
        valA = a[criterioOrdenVariante.value]; valB = b[criterioOrdenVariante.value]
      }
      const res = typeof valA === 'string' ? (valA || '').localeCompare(valB || '') : (valA || 0) - (valB || 0)
      return ordenAscendenteVariante.value ? res : -res
    })
  }
  return filtradas
})

const hayExistencias = computed(() => {
  return Array.isArray(variantes.value) && variantes.value.length > 0
})

// --- ACCIONES ---
function verDetalle(producto) {
  productoSeleccionado.value = producto
  mostrarDetalle.value = true
  fetch(`http://localhost:8080/product/detail/${producto.id}`)
    .then(res => res.json())
    .then(data => {
      // Manejo de la estructura de respuesta que mencionaste
      if (data.value && Array.isArray(data.value)) {
        variantes.value = data.value
      } else {
        variantes.value = []
      }
    })
    .catch(() => (variantes.value = []))
}

function volverLista() {
  mostrarDetalle.value = false
  productoSeleccionado.value = null
  busquedaVariante.value = ''
  criterioOrdenVariante.value = 'sku'
  variantes.value = []
}

function formato(valor) {
  return '$' + Number(valor).toFixed(2)
}

function fetchInventario() {
  fetch('http://localhost:8080/product')
    .then(res => res.json())
    .then(data => {
      inventario.value = Array.isArray(data) ? data : []
    })
}

onMounted(fetchInventario)
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f0fdf4;
}

.reposicion-panel,
.reposicion-formulario {
  flex: 1;
  padding: 2rem;
  padding-top: 1rem;
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

.select-input, .search-input {
  padding: 0.5rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  background-color: #fff;
  outline: none;
}

.search-input { width: 220px; }

.btn-orden {
  background-color: #34d399;
  color: white;
  border: none;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  min-width: 130px;
}

.tabla-productos {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.table-container-centered {
  display: flex;
  justify-content: center;
  width: 100%;
}

.tabla-ajustada {
  width: auto;
  min-width: 60%;
}

.tabla-productos thead { background-color: #d1fae5; color: #065f46; }

.tabla-productos th, .tabla-productos td {
  padding: 1rem 2rem;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.sku-cell { font-family: 'Courier New', Courier, monospace;; font-weight: bold; }
.sku-cell-small { 
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold; 
  
  font-size: 1rem;
  background: #f0fdf4;
  padding: 4px 8px;
  border-radius: 4px;
}


.stock-cell { font-weight: bold; text-align: center !important; }

.tabla-productos tbody tr:hover { background-color: #f0fdf4; cursor: pointer; }

.no-stock-msg {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
  background: white;
  border-radius: 12px;
}

.bottom-actions { display: flex; justify-content: flex-end; }

button.secundario {
  background-color: #d1fae5;
  color: #065f46;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
</style>