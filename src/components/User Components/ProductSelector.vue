<template>
  <div class="selector-panel">
    <h2>Seleccionar producto</h2>

    <div class="table-controls">
      <input
        type="text"
        v-model="busqueda"
        placeholder="Buscar producto..."
        class="search-input"
      />
    </div>

    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Marca</th>
          <th>Precio</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="producto in productosFiltrados"
          :key="producto.nombre"
          @click="seleccionar(producto)"
        >
          <td>{{ producto.nombre }}</td>
          <td>{{ producto.descripcion }}</td>
          <td>{{ producto.marca }}</td>
          <td>{{ formato(producto.precio) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="button-group">
      <button type="button" @click="$emit('cerrar')">Cerrar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['productos'])
const emit = defineEmits(['seleccionar', 'cerrar'])

const busqueda = ref('')

const productosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase()
  return props.productos.filter(p =>
    p.nombre.toLowerCase().includes(texto) ||
    p.descripcion.toLowerCase().includes(texto) ||
    p.marca.toLowerCase().includes(texto)
  )
})

function seleccionar(producto) {
  emit('seleccionar', producto)
}

function formato(valor) {
  return 'Bs ' + valor.toFixed(2)
}
</script>

<style scoped>
.selector-panel {
  background-color: #f0fdf4;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-family: "Inter", sans-serif;
  max-width: 900px;
  margin: auto;
  margin-top: 2vh;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.selector-panel h2 {
  font-size: 1.5rem;
  color: #166534;
  text-align: center;
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
}

.search-input:focus {
  outline: none;
  border-color: #34d399;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

thead {
  background-color: #d1fae5;
  color: #065f46;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
}

th:last-child,
td:last-child {
  border-right: none;
}

tr:hover {
  background-color: #ecfdf5;
  cursor: pointer;
}

.button-group {
  display: flex;
  justify-content: flex-end;
}

button {
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-family: "Inter", sans-serif;
    transition: background-color 0.3s ease;
    min-width: 140px;
    /* ← ancho uniforme */
    text-align: center;
    background-color: #e5e7eb;
    color: #374151;
}

button:hover{
  background-color: #d1d5db;
}


</style>
