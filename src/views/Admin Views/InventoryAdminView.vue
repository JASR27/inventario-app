<template>
  <div class="layout">
    <Sidebar />

    <div v-if="!mostrarDetalle && !mostrarFormulario" class="reposicion-panel">
      <h2>Inventario General</h2>

      <div class="toolbar-tabla">
        <div class="control-group">
          <label>Buscar por:</label>
          <select v-model="campoBusqueda" class="select-input-toolbar">
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
            class="search-input-toolbar" 
          />
        </div>

        <div class="control-group">
          <label>Ordenar por:</label>
          <select v-model="criterioOrden" class="select-input-toolbar">
            <option value="name">Nombre</option>
            <option value="brand">Marca</option>
            <option value="sku">SKU</option>
            <option value="buyingPrice">Precio Adquisición</option>
            <option value="sellingPrice">Precio Venta</option>
          </select>
          <button @click="ordenAscendente = !ordenAscendente" class="btn-orden-tabla">
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
            <th>Precio Adquisición</th>
            <th>Precio Venta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(producto, index) in productosFiltradosYOrdenados" :key="index">
            <td>{{ producto.name }}</td>
            <td>{{ producto.brand?.name }}</td>
            <td>{{ producto.description }}</td>
            <td><span class="sku-badge">{{ generarSKU(producto) }}</span></td>
            <td>{{ formato(producto.buyingPrice) }}</td>
            <td>{{ formato(producto.sellingPrice) }}</td>
            <td>
              <div class="action-buttons">
                <button @click="verExistencias(producto)" class="btn-existencias">Ver existencias</button>
                <button @click="editarProducto(producto)" class="btn-editar">Editar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="mostrarDetalle" class="reposicion-formulario">
      <h2>Inventario de: {{generarSKU(productoSeleccionado) }}</h2>

      <div class="toolbar-tabla">
        <div class="control-group">
          <label>Filtrar variantes:</label>
          <input 
            type="text" 
            v-model="busquedaVariante" 
            placeholder="Color, talla o SKU..." 
            class="search-input-toolbar" 
          />
        </div>
        <div class="control-group">
          <label>Ordenar por:</label>
          <select v-model="criterioOrdenVariante" class="select-input-toolbar">
            <option value="sku">SKU Variante</option>
            <option value="color">Color</option>
            <option value="talla">Talla</option>
            <option value="cantidad">Stock</option>
          </select>
          <button @click="ordenAscendenteVariante = !ordenAscendenteVariante" class="btn-orden-tabla">
            {{ ordenAscendenteVariante ? 'Ascendente ▲' : 'Descendente ▼' }}
          </button>
        </div>
      </div>

      <table class="tabla-productos">
        <thead>
          <tr>
            <th>SKU Variante</th>
            <th>Color</th>
            <th>Talla</th>
            <th>Cantidad disponible</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="variantesFiltradasYOrdenadas.length === 0">
            <td colspan="4" class="empty-msg">No hay existencias para mostrar</td>
          </tr>
          <tr v-else v-for="(item, index) in variantesFiltradasYOrdenadas" :key="index">
            <td class="sku-cell-small">{{ item.skuVariante }}</td>
            <td>{{ item.color }}</td>
            <td>{{ item.talla }}</td>
            <td class="stock-cell">{{ item.cantidad }}</td>
          </tr>
        </tbody>
      </table>

      <div class="bottom-actions">
        <button class="secundario" @click="volverLista">Volver al Inventario</button>
      </div>
    </div>

    <div v-else-if="mostrarFormulario" class="product-form">
      <h2>Editar Precios: {{ generarSKU(productoEditado) }}</h2>
      <form @submit.prevent="handleUpdate">
        <div class="form-grid">
          <div class="form-group">
            <label>Precio de adquisición ($):</label>
            <input type="number" v-model.number="productoEditado.buyingPrice" required min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label>Precio de venta ($):</label>
            <input type="number" v-model.number="productoEditado.sellingPrice" required min="0" step="0.01" />
          </div>
        </div>
        <div class="button-group">
          <button type="button" @click="cancelarEdicion" class="btn-cancelar">Cancelar</button>
          <button type="submit" class="btn-guardar">Guardar Cambios</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarAdmin.vue'

// --- ESTADOS ---
const inventario = ref([])
const brands = ref([])
const busqueda = ref('')
const campoBusqueda = ref('todos')
const criterioOrden = ref('name')
const ordenAscendente = ref(true)

const mostrarDetalle = ref(false)
const mostrarFormulario = ref(false)
const productoSeleccionado = ref(null)
const productoEditado = ref(null)

const busquedaVariante = ref('')
const criterioOrdenVariante = ref('sku')
const ordenAscendenteVariante = ref(true)

// --- LÓGICA SKU ---
function generarSKU(producto) {
  if (!producto || !producto.name) return 'N/A'
  const prefijo = producto.name.substring(0, 3).toUpperCase()
  return `${prefijo}-${producto.id}`
}

function generarSKUVariante(variante, producto) {
  const base = generarSKU(producto)
  const talla = variante.size || '0'
  const color = (variante.color || 'UNI').toUpperCase().substring(0, 3)
  return `${base}-${talla}-${color}`
}

// --- COMPUTED: FILTROS Y ORDENAMIENTO (GENERAL) ---
const placeholderBusqueda = computed(() => {
  const ops = { 
    todos: 'Buscar en todo...', 
    name: 'Por nombre...', 
    brand: 'Por marca...', 
    description: 'Por descripción...',
    sku: 'Por SKU...' 
  };
  return ops[campoBusqueda.value];
})

const productosFiltradosYOrdenados = computed(() => {
  let filtrados = inventario.value.filter(p => {
    const termino = busqueda.value.toLowerCase().trim()
    if (!termino) return true
    
    const mName = (p.name || '').toLowerCase().includes(termino)
    const mBrand = (p.brand?.name || '').toLowerCase().includes(termino)
    const mDesc = (p.description || '').toLowerCase().includes(termino)
    const mSKU = generarSKU(p).toLowerCase().includes(termino)

    if (campoBusqueda.value === 'name') return mName
    if (campoBusqueda.value === 'brand') return mBrand
    if (campoBusqueda.value === 'description') return mDesc
    if (campoBusqueda.value === 'sku') return mSKU
    return mName || mBrand || mDesc || mSKU
  })

  filtrados.sort((a, b) => {
    let vA, vB
    if (criterioOrden.value === 'brand') {
      vA = (a.brand?.name || '').toLowerCase(); vB = (b.brand?.name || '').toLowerCase()
    } else if (criterioOrden.value === 'sku') {
      vA = generarSKU(a); vB = generarSKU(b)
    } else if (typeof a[criterioOrden.value] === 'string') {
      vA = (a[criterioOrden.value] || '').toLowerCase(); vB = (b[criterioOrden.value] || '').toLowerCase()
    } else {
      vA = a[criterioOrden.value] || 0; vB = b[criterioOrden.value] || 0
    }
    return ordenAscendente.value ? (vA > vB ? 1 : -1) : (vA < vB ? 1 : -1)
  })
  return filtrados
})

// --- COMPUTED: FILTROS Y ORDENAMIENTO (DETALLE) ---
const variantesFiltradasYOrdenadas = computed(() => {
  const vars = productoSeleccionado.value?.variantes || []
  const termino = busquedaVariante.value.toLowerCase()

  let filtradas = vars.filter(v => 
    v.color?.toLowerCase().includes(termino) || 
    v.talla?.toLowerCase().includes(termino) ||
    v.skuVariante.toLowerCase().includes(termino)
  )

  filtradas.sort((a, b) => {
    let vA = a[criterioOrdenVariante.value], vB = b[criterioOrdenVariante.value]
    if (typeof vA === 'string') return ordenAscendenteVariante.value ? vA.localeCompare(vB) : vB.localeCompare(vA)
    return ordenAscendenteVariante.value ? vA - vB : vB - vA
  })
  return filtradas
})

// --- MÉTODOS API ---
const fetchInventario = async () => {
  try {
    const res = await fetch('http://localhost:8080/product')
    const data = await res.json()
    inventario.value = Array.isArray(data) ? data : []
  } catch (e) { console.error(e) }
}

const verExistencias = async (producto) => {
  try {
    const res = await fetch(`http://localhost:8080/product/detail/${producto.id}`)
    const data = await res.json()
    const rawVars = Array.isArray(data.value) ? data.value : []
    
    producto.variantes = rawVars.map(v => ({
      color: v.color,
      talla: String(v.size),
      cantidad: v.stock,
      skuVariante: generarSKUVariante(v, producto)
    }))
    
    productoSeleccionado.value = producto
    mostrarDetalle.value = true
  } catch (e) { alert("Error al cargar detalles") }
}

const handleUpdate = async () => {
  try {
    const res = await fetch(`http://localhost:8080/product/${productoEditado.value.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: productoEditado.value.id,
        buyingPrice: productoEditado.value.buyingPrice,
        sellingPrice: productoEditado.value.sellingPrice
      })
    })
    if (res.status === 204) {
      alert("Precios actualizados");
      volverLista();
      fetchInventario();
    }
  } catch (e) { alert("Error al actualizar") }
}

// --- NAVEGACIÓN ---
const editarProducto = (p) => { productoEditado.value = { ...p }; mostrarFormulario.value = true; }
const cancelarEdicion = () => volverLista()
const volverLista = () => {
  mostrarDetalle.value = false; mostrarFormulario.value = false
  productoSeleccionado.value = null; productoEditado.value = null
  busquedaVariante.value = ''
}
const formato = (v) => '$' + Number(v).toFixed(2)

onMounted(fetchInventario)
</script>

<style scoped>
/* FUENTE Y LAYOUT */
.layout { 
  display: flex; flex-direction: column; align-items: center; 
  background-color: #ffffff; min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* CONTENEDORES */
.reposicion-panel, .reposicion-formulario, .product-form {
  background-color: #fff7ed; padding: 2rem; border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); width: 100%; max-width: 1150px; margin: 0 auto;
}

h2 { text-align: center; color: #7c2d12; margin-bottom: 1.5rem; }

/* TOOLBAR */
.toolbar-tabla {
  display: flex; justify-content: space-between; align-items: center;
  background-color: #ffffff; padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; gap: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
.control-group { display: flex; align-items: center; gap: 0.6rem; }
.control-group label { font-size: 0.85rem; font-weight: 600; color: #9a3412; }

.select-input-toolbar, .search-input-toolbar {
  padding: 0.5rem; border: 1px solid #fdba74; border-radius: 6px; outline: none;
}
.search-input-toolbar { min-width: 280px; }

.btn-orden-tabla {
  background-color: #f97316; color: white; border: none; padding: 0.5rem 0.8rem;
  border-radius: 6px; font-weight: bold; cursor: pointer;
}

/* TABLA */
.tabla-productos { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; }
.tabla-productos thead { background-color: #fdba74; color: #78350f; }
.tabla-productos th, .tabla-productos td { padding: 0.9rem 1rem; text-align: left; border-bottom: 1px solid #e8e8e8; }
.tabla-productos tbody tr:hover { background-color: #fff1e0; }

/* BADGES Y CELDAS ESPECIALES */
.sku-badge {
  font-family: 'Courier New', monospace; font-weight: bold; color: #000000;
   padding: 4px 8px; border-radius: 4px; 
}
.sku-cell-small { font-family: 'Courier New', monospace; font-size: 0.85rem; font-weight: bold; }
.stock-cell { font-weight: bold; color: #166534; }
.empty-msg { text-align: center; font-style: italic; color: #9a3412; padding: 2rem; }

/* BOTONES */
.action-buttons { display: flex; gap: 0.5rem; }
.action-buttons button { border: none; padding: 0.5rem 0.8rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-existencias { background-color: #fcd34d; color: #78350f; }
.btn-editar { background-color: #f97316; color: white; }

.bottom-actions { display: flex; justify-content: flex-end; margin-top: 1.5rem; }
.secundario { background-color: #fcd34d; color: #78350f; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; }

/* FORMULARIO */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-weight: 600; color: #9a3412; }
.form-group input { padding: 0.8rem; border: 1px solid #fdba74; border-radius: 8px; font-size: 1rem; }
.button-group { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
.button-group button { padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; }
.btn-guardar { background-color: #f97316; color: white; }
.btn-cancelar { background-color: #fcd34d; color: #78350f; }

@media (max-width: 950px) {
  .toolbar-tabla { flex-direction: column; align-items: stretch; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>