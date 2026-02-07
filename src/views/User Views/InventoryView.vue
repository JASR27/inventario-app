<template>
  <div class="layout">
    <Sidebar />

    <!-- Vista general -->
    <div v-if="!mostrarDetalle" class="reposicion-panel">
      <h2>Inventario General</h2>

      <div class="table-controls">
        <input
          type="text"
          v-model="busqueda"
          placeholder="Buscar producto por nombre o marca..."
          class="search-input"
        />
      </div>

      <table class="tabla-productos">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Descripción</th>
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
            <td>{{ formato(producto.buyingPrice) }}</td>
            <td>{{ formato(producto.sellingPrice) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vista detallada -->
    <div v-else class="reposicion-formulario">
      <h2>Inventario de: {{ productoSeleccionado.name }}</h2>

      <div class="table-controls">
        <input
          type="text"
          v-model="busquedaVariante"
          placeholder="Buscar por color o talla..."
          class="search-input"
        />
      </div>

      <!-- Mensaje si no hay existencias -->
      <div v-if="!hayExistencias" class="no-stock-msg">
        No hay existencias para mostrar
      </div>

      <!-- Tabla solo si hay existencias -->
      <table v-else class="tabla-productos">
        <thead>
          <tr>
            <th @click="ordenarPor('color')" class="ordenable">
              Color
              <span v-if="criterioOrden === 'color'">
                {{ ordenAscendente ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="ordenarPor('size')" class="ordenable">
              Talla
              <span v-if="criterioOrden === 'size'">
                {{ ordenAscendente ? '▲' : '▼' }}
              </span>
            </th>
            <th>Cantidad disponible</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in variantesFiltradas" :key="index">
            <td>{{ item.color }}</td>
            <td>{{ item.size }}</td>
            <td>{{ item.stock }}</td>
          </tr>
        </tbody>
      </table>

      <div class="bottom-actions">
        <button class="secundario" @click="volverLista">Volver</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarUser.vue'

const inventario = ref([])
const busqueda = ref('')
const busquedaVariante = ref('')
const mostrarDetalle = ref(false)
const productoSeleccionado = ref(null)
const variantes = ref([])

const criterioOrden = ref(null)
const ordenAscendente = ref(true)

function ordenarPor(campo) {
  if (criterioOrden.value === campo) {
    ordenAscendente.value = !ordenAscendente.value
  } else {
    criterioOrden.value = campo
    ordenAscendente.value = true
  }
}

const productosFiltrados = computed(() =>
  inventario.value.filter(p => {
    const nombre = p.name?.toLowerCase() || ''
    const marca = p.brand?.name?.toLowerCase() || ''
    const termino = busqueda.value.toLowerCase()
    return nombre.includes(termino) || marca.includes(termino)
  })
)

const variantesFiltradas = computed(() => {
  let filtradas = variantes.value.filter(v =>
    v.color?.toLowerCase().includes(busquedaVariante.value.toLowerCase()) ||
    v.size?.toString().includes(busquedaVariante.value)
  )

  if (criterioOrden.value) {
    filtradas.sort((a, b) => {
      const valA = a[criterioOrden.value]?.toString().toLowerCase() || ''
      const valB = b[criterioOrden.value]?.toString().toLowerCase() || ''
      return ordenAscendente.value
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
    })
  }

  return filtradas
})

// Computed para verificar existencias
const hayExistencias = computed(() => {
  if (!Array.isArray(variantes.value) || variantes.value.length === 0) {
    return false
  }
  return variantes.value.some(v => v.stock > 0)
})

function verDetalle(producto) {
  productoSeleccionado.value = producto
  mostrarDetalle.value = true

  // Llamada al endpoint detail
  fetch(`http://localhost:8080/product/detail/${producto.id}`)
    .then(response => {
      if (!response.ok) throw new Error('Error al obtener detalle del producto')
      return response.json()
    })
    .then(data => {
      variantes.value = Array.isArray(data.value) ? data.value : []
    })
    .catch(error => {
      console.error('Error al cargar detalle:', error)
      variantes.value = []
    })
}

function volverLista() {
  mostrarDetalle.value = false
  productoSeleccionado.value = null
  busquedaVariante.value = ''
  criterioOrden.value = null
  variantes.value = []
}

function formato(valor) {
  return '$' + Number(valor).toFixed(2)
}

function fetchInventario() {
  fetch('http://localhost:8080/product')
    .then(response => {
      if (!response.ok) throw new Error('Error al obtener productos')
      return response.json()
    })
    .then(data => {
      inventario.value = Array.isArray(data) ? data : []
    })
    .catch(error => {
      console.error('Error al cargar inventario:', error)
    })
}

onMounted(() => {
  fetchInventario()
})
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
  background-color: #f0fdf4;
  font-family: "Inter", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-sizing: border-box;
}

h2 {
  font-size: 1.6rem;
  color: #166534;
  text-align: center;
  margin-bottom: 1rem;
}

.table-controls {
  display: flex;
  justify-content: flex-end;
}

.search-input {
  padding: 0.75rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #1e293b;
  transition: border-color 0.3s ease;
  width: 300px;
}

.search-input:focus {
  outline: none;
  border-color: #34d399;
}

.tabla-productos {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tabla-productos thead {
  background-color: #d1fae5;
  color: #065f46;
}

.tabla-productos th,
.tabla-productos td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.tabla-productos tr:hover {
  background-color: #ecfdf5;
  cursor: pointer;
}

.bottom-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

button.secundario {
  background-color: #d1fae5;
  color: #065f46;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  transition: background-color 0.3s ease;
}

button.secundario:hover {
  background-color: #a7f3d0;
}


.tabla-productos {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  table-layout: fixed;
  /* ← Fuerza distribución uniforme */
}

.tabla-productos th,
.tabla-productos td {
  width: 33.33%;
  /* ← Cada columna ocupa un tercio */
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  word-wrap: break-word;
  /* ← Evita desbordes de texto */
}
</style>