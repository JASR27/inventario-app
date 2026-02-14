<template>
  <div class="dashboard-wrapper">
    <div v-if="loading" class="status-msg">
      <div class="spinner"></div>
      <p>Sincronizando Inventario...</p>
    </div>

    <div v-else-if="error" class="status-msg error">
      <div class="error-icon">⚠️</div>
      <p>Error: {{ error }}</p>
      <button @click="fetchData" class="retry-btn">Reintentar</button>
    </div>

    <div v-else>
      <header class="dashboard-header">
        <div class="header-top">
          <h1>Reporte de Inventario y Productos</h1>
        </div>

        <div class="kpi-container">
          <div class="kpi-card">
            <span class="label">Modelos de Productos</span>
            <span class="value">{{ metricasInv.totalModelos }}</span>
          </div>
          <div class="kpi-card">
            <span class="label">Existencias Totales</span>
            <span class="value">{{ metricasInv.stockTotal.toLocaleString() }}</span>
          </div>
          <div class="kpi-card highlight">
            <span class="label">Valorización de Stock</span>
            <span class="value">${{ metricasInv.valorInventario.toLocaleString() }}</span>
          </div>

          <div class="kpi-card filter-card">
            <span class="label">Filtrar Periodo</span>
            <select v-model="filtroTiempo" class="styled-select">
              <option v-for="opcion in opcionesTiempo" :key="opcion.valor" :value="opcion.valor">
                {{ opcion.label }}
              </option>
            </select>
          </div>
        </div>
      </header>

      <div class="charts-grid">
        <div class="chart-panel main-chart">
          <h3>Productos Más Vendidos (Unidades)</h3>
          <div class="chart-container">
            <Bar :data="dataMasVendidos" :options="optionsMasVendidos" />
          </div>
        </div>

        <div class="chart-panel side-chart">
          <h3>Alertas de Inventario (Semáforo)</h3>
          <div class="chart-container">
            <Bar :data="dataSemaforo" :options="optionsSemaforo" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, 
  CategoryScale, LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// --- ESTADO ---
const productos = ref([])
const ventas = ref([])
const loading = ref(true)
const error = ref(null)
const filtroTiempo = ref('1w')

const opcionesTiempo = [
  { label: 'Última Semana', valor: '1w' },
  { label: 'Último Mes', valor: '1m' },
  { label: 'Último Trimestre', valor: '3m' },
  { label: 'Último Año', valor: '1y' }
]

// --- FETCH DATA ---
const fetchData = async () => {
  try {
    loading.value = true
    error.value = null

    const [resP, resV] = await Promise.all([
      fetch('http://localhost:8080/product'),
      fetch('http://localhost:8080/sale')
    ])

    if (!resP.ok || !resV.ok) throw new Error("Fallo al conectar con los servicios API")

    const listaProductos = await resP.json()
    ventas.value = await resV.json()

    const datosCompletos = []
    for (const p of listaProductos) {
      try {
        const resD = await fetch(`http://localhost:8080/product/detail/${p.id}`)
        const detalle = await resD.json()
        const listaDetalles = detalle && Array.isArray(detalle.value) ? detalle.value : []
        datosCompletos.push({ ...p, detalles: listaDetalles })
      } catch (e) {
        datosCompletos.push({ ...p, detalles: [] })
      }
    }
    productos.value = datosCompletos
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// --- LÓGICA DE MÉTRICAS ---
const metricasInv = computed(() => {
  let totalStock = 0
  let valor = 0
  productos.value.forEach(p => {
    const detallesSeguros = Array.isArray(p.detalles) ? p.detalles : []
    const stockP = detallesSeguros.reduce((acc, d) => acc + (Number(d.stock) || 0), 0)
    totalStock += stockP
    valor += stockP * parseFloat(p.buyingPrice || 0)
  })
  return { totalModelos: productos.value.length, stockTotal: totalStock, valorInventario: valor }
})

// --- DATA GRÁFICO: MÁS VENDIDOS ---
const dataMasVendidos = computed(() => {
  const ahora = new Date()
  const limites = { '1w': 7, '1m': 30, '3m': 90, '1y': 365 }
  
  const vts = ventas.value.filter(v => {
    const diff = (ahora - new Date(v.createdAt)) / (1000*60*60*24)
    return diff <= limites[filtroTiempo.value]
  })

  const conteo = {}
  vts.forEach(v => {
    v.items?.forEach(i => {
      const label = i.productDetail?.sku || 'Sin SKU'
      conteo[label] = (conteo[label] || 0) + (i.quantity || 0)
    })
  })

  const sorted = Object.entries(conteo).sort((a,b) => b[1]-a[1]).slice(0, 10)
  
  return {
    labels: sorted.map(s => s[0]),
    datasets: [{
      label: 'Unidades Vendidas',
      data: sorted.map(s => s[1]),
      backgroundColor: '#fbbf24aa',
      borderColor: '#fbbf24',
      borderWidth: 1,
      borderRadius: 5
    }]
  }
})

// --- DATA GRÁFICO: SEMÁFORO ---
const dataSemaforo = computed(() => {
  const allDetails = productos.value.flatMap(p => Array.isArray(p.detalles) ? p.detalles : [])
  const sorted = allDetails.sort((a,b) => (a.stock || 0) - (b.stock || 0)).slice(0, 15)

  return {
    labels: sorted.map(s => s.sku || 'N/A'),
    datasets: [{
      label: 'Stock',
      data: sorted.map(s => s.stock || 0),
      backgroundColor: sorted.map(s => {
        const st = s.stock || 0
        if (st < 10) return '#ef4444aa'
        if (st < 25) return '#fbbf24aa'
        return '#22c55eaa'
      }),
      borderColor: sorted.map(s => {
        const st = s.stock || 0
        if (st < 10) return '#ef4444'
        if (st < 25) return '#fbbf24'
        return '#22c55e'
      }),
      borderWidth: 1,
      borderRadius: 5
    }]
  }
})

const optionsMasVendidos = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } }
}

const optionsSemaforo = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } }
}
</script>

<style scoped>
.dashboard-wrapper {
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
  color: #1e293b;
}

.status-msg { text-align: center; padding: 5rem; font-size: 1.2rem; color: #64748b; }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #f97316; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

.dashboard-header { margin-bottom: 2rem; }
.header-top h1 { font-size: 1.8rem; margin-bottom: 1.5rem; margin-top: 0; text-align: center; color: #7c2d12; }

.kpi-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr) 200px;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.kpi-card .label { color: #64748b; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; }
.kpi-card .value { font-size: 1.75rem; font-weight: 700; }
.highlight { border-top: 4px solid #f97316; }

/* ESTILO PARA EL SELECTOR EN TARJETA */
.filter-card { justify-content: center; }
.styled-select {
  padding: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.chart-panel {
  background: white;
  padding: 1.5rem;
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chart-panel h3 { margin-bottom: 1.5rem; font-size: 1.1rem; color: #475569; text-align: center; }
.chart-container { height: 360px; position: relative; }

@media (max-width: 1200px) {
  .kpi-container { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
}
</style>