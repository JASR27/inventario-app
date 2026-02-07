<template>
  <div class="selector-panel">
    <h2>Seleccionar Producto</h2>

    <div class="table-controls">
      <div class="tasa-referencia" v-if="tasaCambio > 0">
        <small>Tasa: 1$ = {{ formatoBs(tasaCambio) }}</small>
      </div>
      <input 
        type="text" 
        v-model="busqueda" 
        placeholder="Buscar por nombre, descripción o marca..." 
        class="search-input" 
      />
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Marca</th>
            <th v-if="modo === 'venta'">Precio Venta</th>
            <th v-else>Precio de Compra</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="producto in productosFiltrados" 
            :key="producto.id" 
            @click="seleccionar(producto)"
          >
            <td>{{ producto.name }}</td>
            <td class="text-muted">{{ producto.description }}</td>
            <td>{{ producto.brand?.name }}</td>
            <td class="col-precio-dual">
              <div class="precio-usd">
                {{ formatearNumero(modo === 'venta' ? producto.sellingPrice : producto.buyingPrice) }}$
              </div>
              <div class="precio-bs">
                {{ formatoBs((Number(modo === 'venta' ? producto.sellingPrice : producto.buyingPrice || 0)) * (tasaCambio || 1)) }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="button-group">
      <button type="button" class="btn-cerrar" @click="$emit('cerrar')">Cerrar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['seleccionar', 'cerrar'])
const props = defineProps({
  modo: {
    type: String,
    default: 'venta',
  },
})

const productos = ref([])
const busqueda = ref('')
const tasaCambio = ref(0)

function formatearNumero(valor) {
  const numero = parseFloat(valor) || 0;
  return numero.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatoBs(valor) {
  return 'Bs ' + formatearNumero(valor);
}

async function fetchTasa() {
  try {
    const res = await fetch('http://localhost:8080/currency/exchange_rate')
    if (res.ok) {
      const texto = await res.text()
      tasaCambio.value = parseFloat(texto)
    }
  } catch (e) { 
    console.error("Error cargando tasa:", e) 
  }
}

async function fetchProductos() {
  try {
    const response = await fetch('http://localhost:8080/product')
    if (!response.ok) throw new Error('Error al cargar productos')
    const data = await response.json()

    if (props.modo === 'venta') {
      const promesas = data.map(async (p) => {
        try {
          const detalleResp = await fetch(`http://localhost:8080/product/detail/${p.id}`)
          if (!detalleResp.ok) return null
          const detalle = await detalleResp.json()
          const variantes = Array.isArray(detalle) ? detalle : (detalle.value || [])
          const totalStock = variantes.reduce((acc, v) => acc + (v.stock || 0), 0)
          return totalStock >= 1 ? p : null
        } catch { return null }
      })
      const resultados = await Promise.all(promesas)
      productos.value = resultados.filter(p => p !== null)
    } else {
      productos.value = data
    }
  } catch (error) {
    console.error('Error al obtener productos:', error)
  }
}

const productosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase()
  return productos.value.filter(
    p =>
      p.name.toLowerCase().includes(texto) ||
      p.description.toLowerCase().includes(texto) ||
      p.brand?.name.toLowerCase().includes(texto)
  )
})

function seleccionar(producto) {
  emit('seleccionar', producto)
}

onMounted(() => {
  fetchTasa()
  fetchProductos()
})
</script>

<style scoped>
.selector-panel {
  background-color: #fff7ed; /* Naranja muy claro */
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(154, 52, 18, 0.1);
  font-family: "Inter", sans-serif;
  max-width: 900px;
  margin: 2vh auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 1px solid #fdba74;
}

.selector-panel h2 {
  font-size: 1.5rem;
  color: #9a3412; /* Naranja oscuro */
  text-align: center;
  margin: 0;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.tasa-referencia {
  background: #ffedd5;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #9a3412;
  font-weight: 700;
  border: 1px solid #fdba74;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #fdba74;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
}

.search-input:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
}

.table-container {
  max-height: 400px;
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid #fed7aa;
  background: white;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #ffedd5;
  position: sticky;
  top: 0;
  z-index: 10;
}

th {
  padding: 1rem;
  text-align: left;
  color: #9a3412;
  font-weight: 700;
  border-bottom: 2px solid #fdba74;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #fff7ed;
  color: #431407;
}

tr:hover {
  background-color: #fff7ed;
  cursor: pointer;
}

.text-muted {
  font-size: 0.85rem;
  color: #7c2d12;
  opacity: 0.7;
}

.col-precio-dual {
  display: flex;
  flex-direction: column;
}

.precio-usd {
  font-weight: 800;
  color: #1e293b;
}

.precio-bs {
  font-size: 0.8rem;
  color: #f97316; /* Naranja vibrante para el precio en Bs */
  font-weight: 600;
}

.button-group {
  display: flex;
  justify-content: flex-end;
}

.btn-cerrar {
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-cerrar:hover {
  background-color: #e5e7eb;
}
</style>