<template>
  <div class="selector-panel">
    <h2>Seleccionar Cliente</h2>

    <div class="toolbar">
      <div class="control-group">
        <label>Buscar por:</label>
        <select v-model="campoBusqueda" class="select-input">
          <option value="todos">Todos los campos</option>
          <option value="fullName">Nombre Completo</option>
          <option value="nid">NID / Cédula</option>
          <option value="address">Dirección</option>
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
          <option value="fullName">Nombre</option>
          <option value="nid">NID</option>
          <option value="address">Dirección</option>
        </select>
        <button @click="ordenAscendente = !ordenAscendente" class="btn-orden">
          {{ ordenAscendente ? 'Ascendente ▲' : 'Descendente ▼' }}
        </button>
      </div>
    </div>

    <div class="table-container">
      <table class="tabla-clientes">
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>NID</th>
            <th>Dirección</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="cliente in clientesFiltrados"
            :key="cliente.nid"
            @click="seleccionar(cliente)"
            class="fila-cliente"
          >
            <td class="col-nombre">{{ cliente.fullName }}</td>
            <td class="col-nid">{{ cliente.nid }}</td>
            <td class="col-direccion">{{ cliente.address || 'Sin dirección' }}</td>
          </tr>
          <tr v-if="clientesFiltrados.length === 0">
            <td colspan="3" class="no-results">
              No se encontraron clientes que coincidan con "{{ busqueda }}"
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="button-group">
      <button type="button" class="btn-cerrar" @click="$emit('cerrar')">
        Cancelar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '../../store/useNotificationStore.js'; // Importación del store

const notificationStore = useNotificationStore();
const emit = defineEmits(['seleccionar', 'cerrar'])

// --- ESTADOS ---
const clientes = ref([])
const busqueda = ref('')
const campoBusqueda = ref('todos')
const criterioOrden = ref('fullName')
const ordenAscendente = ref(true)

// --- CARGA DE DATOS ---
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:8080/client')
    if (!response.ok) throw new Error('Error al obtener clientes')
    
    const data = await response.json()
    const listaFinal = Array.isArray(data) ? data : []
    
    clientes.value = listaFinal

    // Notificar si la base de datos está vacía
    if (listaFinal.length === 0) {
      notificationStore.addNotification("Información", "No hay clientes registrados en el sistema.", "info")
    }
  } catch (error) {
    notificationStore.addNotification("Error", "No se pudo cargar la lista de clientes.", "error")
    console.error('Error cargando clientes:', error)
  }
})

// --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
const placeholderBusqueda = computed(() => {
  const ops = {
    todos: 'Buscar en cualquier campo...',
    fullName: 'Nombre del cliente...',
    nid: 'Cédula o RIF...',
    address: 'Calle, ciudad...'
  }
  return ops[campoBusqueda.value]
})

const clientesFiltrados = computed(() => {
  let filtrados = [...clientes.value]

  // 1. Filtrado dinámico
  if (busqueda.value.trim()) {
    const texto = busqueda.value.toLowerCase()
    filtrados = filtrados.filter(c => {
      const nombre = (c.fullName || '').toLowerCase()
      const nid = (c.nid || '').toLowerCase()
      const dir = (c.address || '').toLowerCase()

      if (campoBusqueda.value === 'fullName') return nombre.includes(texto)
      if (campoBusqueda.value === 'nid') return nid.includes(texto)
      if (campoBusqueda.value === 'address') return dir.includes(texto)
      
      return nombre.includes(texto) || nid.includes(texto) || dir.includes(texto)
    })
  }

  // 2. Ordenamiento
  filtrados.sort((a, b) => {
    const valA = (a[criterioOrden.value] || '').toString().toLowerCase()
    const valB = (b[criterioOrden.value] || '').toString().toLowerCase()
    
    const res = valA.localeCompare(valB, 'es', { sensitivity: 'base' })
    return ordenAscendente.value ? res : -res
  })

  return filtrados
})

// --- ACCIONES ---
function seleccionar(cliente) {
  notificationStore.addNotification(
    "Cliente Seleccionado", 
    `${cliente.fullName} se ha vinculado a la operación.`, 
    "success"
  )
  emit('seleccionar', cliente)
}
</script>

<style scoped>
/* Los estilos se mantienen iguales a tu diseño previo para conservar la estética */
.selector-panel {
  background-color: #f0fdf4;
  padding: 2rem;
  border-radius: 12px;
  font-family: "Inter", sans-serif;
  max-width: 1000px;
  margin: 2vh auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

h2 { font-size: 1.6rem; color: #166534; text-align: center; margin: 0; }

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

.control-group { display: flex; align-items: center; gap: 0.75rem; }
.control-group label { font-weight: 600; color: #374151; font-size: 0.85rem; }

.select-input, .search-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  background-color: #fff;
  outline: none;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.search-input { width: 220px; }
.search-input:focus { border-color: #10b981; }

.btn-orden {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
}

.table-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
}

.tabla-clientes { width: 100%; border-collapse: collapse; }
.tabla-clientes thead {
  position: sticky;
  top: 0;
  background-color: #d1fae5;
  color: #065f46;
}

.tabla-clientes th, .tabla-clientes td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.fila-cliente:hover { background-color: #f0fdf4; cursor: pointer; }

.col-nombre { font-weight: 600; color: #111827; }
.col-nid { font-weight: 600; color: #111827; }

.no-results { text-align: center; padding: 2rem; color: #94a3b8; font-style: italic; text-align: center; }

.button-group { display: flex; justify-content: flex-end; }
.btn-cerrar {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}
</style>