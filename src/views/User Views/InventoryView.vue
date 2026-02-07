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
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(producto, index) in productosFiltrados"
            :key="index"
            @click="verDetalle(producto)"
          >
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.marca }}</td>
            <td>{{ producto.descripcion }}</td>
            <td>{{ formato(producto.precio) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vista detallada -->
    <div v-else class="reposicion-formulario">
      <h2>Inventario de: {{ productoSeleccionado.nombre }}</h2>

      <div class="table-controls">
        <input
          type="text"
          v-model="busquedaVariante"
          placeholder="Buscar por color o talla..."
          class="search-input"
        />
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
          <tr v-for="(item, index) in variantesFiltradas" :key="index">
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarUser.vue'

const inventario = ref([
  {
    nombre: 'Zapato Deportivo',
    descripcion: 'Cómodo para correr',
    marca: 'Nike',
    precio: 120,
    variantes: [
      { color: 'Negro', talla: '40', cantidad: 12 },
      { color: 'Blanco', talla: '41', cantidad: 8 }
    ]
  },
  {
    nombre: 'Botín Casual',
    descripcion: 'Ideal para oficina',
    marca: 'Clarks',
    precio: 180,
    variantes: [
      { color: 'Marrón', talla: '39', cantidad: 5 },
      { color: 'Negro', talla: '40', cantidad: 3 }
    ]
  },
  {
    nombre: 'Sandalia Clásica',
    descripcion: 'Fresca y ligera',
    marca: 'Crocs',
    precio: 90,
    variantes: [
      { color: 'Azul', talla: '38', cantidad: 10 },
      { color: 'Rojo', talla: '37', cantidad: 6 }
    ]
  }
])

const busqueda = ref('')
const busquedaVariante = ref('')
const mostrarDetalle = ref(false)
const productoSeleccionado = ref(null)

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
  inventario.value.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
    p.marca.toLowerCase().includes(busqueda.value.toLowerCase())
  )
)

const variantesFiltradas = computed(() => {
  if (!productoSeleccionado.value) return []

  const termino = busquedaVariante.value.toLowerCase()
  let filtradas = productoSeleccionado.value.variantes.filter(v =>
    v.color.toLowerCase().includes(termino) ||
    v.talla.toLowerCase().includes(termino)
  )

  if (criterioOrden.value) {
    filtradas.sort((a, b) => {
      const valA = a[criterioOrden.value].toLowerCase()
      const valB = b[criterioOrden.value].toLowerCase()
      return ordenAscendente.value
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
    })
  }

  return filtradas
})

function verDetalle(producto) {
  productoSeleccionado.value = producto
  mostrarDetalle.value = true
}

function volverLista() {
  mostrarDetalle.value = false
  productoSeleccionado.value = null
  busquedaVariante.value = ''
  criterioOrden.value = null
}
function formato(valor) {
  return 'Bs ' + valor.toFixed(2)
}
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