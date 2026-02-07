<template>
  <div class="layout">
    <Sidebar />

    <!-- Vista general -->
    <div v-if="!mostrarDetalle && !mostrarFormulario" class="reposicion-panel">
      <h2>Inventario General</h2>

      <div class="table-controls">
        <input type="text" v-model="busqueda" placeholder="Buscar producto por nombre o marca..."
          class="search-input" />
      </div>

      <table class="tabla-productos">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Descripción</th>
            <th>Precio de adquisición</th>
            <th>Precio de venta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(producto, index) in productosFiltrados" :key="index">
            <td>{{ producto.name }}</td>
            <td>{{ producto.brand?.name }}</td>
            <td>{{ producto.description }}</td>
            <td>{{ formato(producto.buyingPrice) }}</td>
            <td>{{ formato(producto.sellingPrice) }}</td>
            <td>
              <button @click="verExistencias(producto)">Ver existencias</button>
              <button @click="editarProducto(producto)">Editar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vista detallada -->
    <div v-else-if="mostrarDetalle" class="reposicion-formulario">
      <h2>Inventario de: {{ productoSeleccionado.name }}</h2>

      <div class="table-controls">
        <input type="text" v-model="busquedaVariante" placeholder="Buscar por color o talla..." class="search-input" />
      </div>

      <table class="tabla-productos">
        <thead>
          <tr>
            <th @click="ordenarPor('color')" class="ordenable">
              Color
              <span v-if="criterioOrden === 'color'">
                {{ ordenAscendente ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="ordenarPor('talla')" class="ordenable">
              Talla
              <span v-if="criterioOrden === 'talla'">
                {{ ordenAscendente ? '▲' : '▼' }}
              </span>
            </th>
            <th>Cantidad disponible</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="variantesFiltradas.length === 0">
            <td colspan="3" style="text-align:center; font-style:italic; color:gray;">
              No hay existencias para mostrar
            </td>
          </tr>
          <tr v-else v-for="(item, index) in variantesFiltradas" :key="index">
            <td>{{ item.color }}</td>
            <td>{{ item.talla }}</td>
            <td>{{ item.cantidad }}</td>
          </tr>
        </tbody>

      </table>

      <div class="bottom-actions">
        <button class="secundario" @click="volverLista">Volver</button>
      </div>
    </div>

    <!-- Formulario de edición -->
    <div v-else-if="mostrarFormulario" class="product-form">
      <h2>Editar Precios del Producto</h2>
      <form @submit.prevent="handleUpdate">
        <div class="form-grid">
          <div class="form-group">
            <label for="buyingPrice">Precio de adquisición:</label>
            <input type="number" id="buyingPrice" v-model.number="productoEditado.buyingPrice" required min="0.01"
              step="0.01" />
          </div>

          <div class="form-group">
            <label for="sellingPrice">Precio de venta:</label>
            <input type="number" id="sellingPrice" v-model.number="productoEditado.sellingPrice" required min="0.01"
              step="0.01" />
          </div>
        </div>

        <div class="button-group">
          <button type="button" @click="cancelarEdicion">Volver</button>
          <button type="submit">Editar</button>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarAdmin.vue'

const inventario = ref([])
const busqueda = ref('')
const busquedaVariante = ref('')
const mostrarDetalle = ref(false)
const mostrarFormulario = ref(false)
const productoSeleccionado = ref(null)
const productoEditado = ref(null)

const criterioOrden = ref(null)
const ordenAscendente = ref(true)
const brands = ref([])

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
  const variantes = productoSeleccionado.value?.variantes
  if (!Array.isArray(variantes)) return []

  const termino = busquedaVariante.value.toLowerCase()
  let filtradas = variantes.filter(v =>
    v.color?.toLowerCase().includes(termino) ||
    v.talla?.toLowerCase().includes(termino)
  )

  if (criterioOrden.value) {
    filtradas.sort((a, b) => {
      const valA = a[criterioOrden.value]?.toLowerCase() || ''
      const valB = b[criterioOrden.value]?.toLowerCase() || ''
      return ordenAscendente.value
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
    })
  }

  return filtradas
})

function verDetalle(producto) {
  fetch(`http://localhost:8080/product/detail/${producto.id}`)
    .then(response => {
      if (!response.ok) throw new Error("Error al obtener detalles del producto")
      return response.json()
    })
    .then(data => {
      const variantes = Array.isArray(data.value) ? data.value : []

      // Mapear si hay existencias, o dejar vacío
      producto.variantes = variantes.map(v => ({
        color: v.color,
        talla: String(v.size),
        cantidad: v.stock
      }))

      productoSeleccionado.value = producto
      mostrarDetalle.value = true
    })
    .catch(error => {
      console.error("Error al cargar detalles:", error)
      alert("No se pudieron cargar las existencias del producto.")
    })
}



function volverLista() {
  mostrarDetalle.value = false
  mostrarFormulario.value = false
  productoSeleccionado.value = null
  productoEditado.value = null
  busquedaVariante.value = ''
  criterioOrden.value = null
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

function fetchBrands() {
  fetch("http://localhost:8080/brand")
    .then(response => {
      if (!response.ok) throw new Error("Error al cargar marcas")
      return response.json()
    })
    .then(data => {
      brands.value = Array.isArray(data) ? data : []
    })
    .catch(error => {
      console.error("Error al obtener marcas:", error)
    })
}

// 🔹 Nuevos métodos
function verExistencias(producto) {
  verDetalle(producto)
}

function editarProducto(producto) {
  productoEditado.value = { ...producto } // clonar datos
  mostrarFormulario.value = true
}

function cancelarEdicion() {
  volverLista()
}

function handleUpdate() {
  const payload = {
    id: productoEditado.value.id,
    buyingPrice: productoEditado.value.buyingPrice,
    sellingPrice: productoEditado.value.sellingPrice
  }

  fetch(`http://localhost:8080/product/${payload.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (response.status === 204) {
        // ✅ Éxito sin contenido
        alert(`Precios del producto actualizados con éxito`)
        volverLista()
        fetchInventario()
      } else {
        throw new Error("Error al actualizar precios del producto")
      }
    })
    .catch(error => {
      console.error("Error:", error)
      alert("Hubo un problema al actualizar los precios.")
    })
}



onMounted(() => {
  fetchInventario()
  fetchBrands()
})
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

/* Fuente global */
* {
  font-family: "Inter", sans-serif;
}

body {
  background-color: #fffaf0;
  margin: 0;
  padding: 2rem;
}

h2 {
  text-align: center;
  color: #7c2d12;
  /* naranja oscuro */
}

.reposicion-formulario,
.product-form {
  margin: 0 auto;
  max-width: 800px;
}


/* Contenedor principal */
.layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Panel de inventario general */
.reposicion-panel {
  background-color: #fff7ed;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Controles de búsqueda */
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #fdba74;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #3b2f2f;
  width: 100%;
  max-width: 300px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #fb923c;
}

/* Tabla de productos */
.tabla-productos {
  background-color: #fff7ed;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 0.95rem;
  width: 100%;
}

.tabla-productos thead {
  background-color: #fdba74;
  color: #78350f;
}

.tabla-productos th,
.tabla-productos td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #fde68a;
}

.tabla-productos tbody tr {
  transition: background-color 0.3s ease;
}

.tabla-productos tbody tr:hover {
  background-color: #fff1e0;
}

/* Botones de acciones en la tabla */
.tabla-productos button {
  margin-right: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
}

.tabla-productos button:first-of-type {
  background-color: #fcd34d;
  color: #78350f;
}

.tabla-productos button:first-of-type:hover {
  background-color: #fbbf24;
}

.tabla-productos button:last-of-type {
  background-color: #f97316;
  color: white;
}

.tabla-productos button:last-of-type:hover {
  background-color: #ea580c;
}

/* Vista detallada */
.reposicion-formulario {
  background-color: #fff7ed;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.reposicion-formulario h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #7c2d12;
}

/* Formulario de edición */
.product-form {
  background-color: #fff7ed;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-form h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #7c2d12;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.product-form label {
  font-weight: 600;
  color: #9a3412;
  margin-bottom: 0.5rem;
}

.product-form input,
.product-form select,
.product-form textarea {
  padding: 0.75rem;
  border: 1px solid #fdba74;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #3b2f2f;
  transition: border-color 0.3s ease;
}

.product-form input:focus,
.product-form select:focus,
.product-form textarea:focus {
  outline: none;
  border-color: #fb923c;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.button-group button {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-family: "Inter", sans-serif;
}

.button-group button[type="submit"] {
  background-color: #f97316;
  color: white;
}

.button-group button[type="submit"]:hover {
  background-color: #ea580c;
}

.button-group button[type="button"] {
  background-color: #fcd34d;
  color: #78350f;
}

.button-group button[type="button"]:hover {
  background-color: #fbbf24;
}

button.secundario {
  background-color: #fcd34d;
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  color: #78350f;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button.secundario:hover {
  background-color: #fbbf24;
}

/* Responsive */
@media (max-width: 900px) {
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: 100%;
  }

  .tabla-productos,
  .product-form {
    max-width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  h2 {
    color: #7c2d12;
  }
}
</style>