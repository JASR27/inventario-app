<template>
  <div class="dashboard-wrapper">
    <div v-if="loading" class="status-msg">Cargando reporte de ausencias...</div>
    <div v-else-if="error" class="status-msg error">Error: {{ error }}</div>

    <div v-else>
      <header class="dashboard-header">
        <div class="header-top">
          <h1>Reporte de Ausencias y Permisos</h1>
        </div>
        
        <div class="kpi-container">
          <div class="kpi-card">
            <span class="label">Permisos Solicitados</span>
            <span class="value">{{ metricas.totalSolicitados }}</span>
          </div>
          <div class="kpi-card">
            <span class="label">Permisos Aprobados</span>
            <span class="value">{{ metricas.totalAprobados }}</span>
          </div>
          <div class="kpi-card highlight">
            <span class="label">Horas Aprobadas</span>
            <span class="value">{{ metricas.horasTotales }}h</span>
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
          <h3>Tendencia de Ausencias (Horas vs Cantidad)</h3>
          <div class="chart-container">
            <Chart type="bar" :data="dataTendencia" :options="optionsTendencia" />
          </div>
        </div>

        <div class="chart-panel side-chart">
          <h3>Empleados por Horas de Permiso</h3>
          <div class="chart-container">
            <Bar :data="dataEmpleados" :options="optionsEmpleados" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar, Chart } from 'vue-chartjs'
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, 
  CategoryScale, LinearScale, PointElement, LineElement, 
  LineController, BarController
} from 'chart.js'

ChartJS.register(
  Title, Tooltip, Legend, BarElement, CategoryScale, 
  LinearScale, PointElement, LineElement, LineController, BarController
)

// --- ESTADO ---
const absenceData = ref([])
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
const fetchAbsences = async () => {
  try {
    loading.value = true
    const response = await fetch('http://localhost:8080/absence')
    if (!response.ok) throw new Error('Error al conectar con el servidor')
    absenceData.value = await response.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchAbsences)

// --- LÓGICA DE PROCESAMIENTO ---
const datosFiltrados = computed(() => {
  const ahora = new Date()
  const limites = { '1w': 7, '1m': 30, '3m': 90, '1y': 365 }
  
  return absenceData.value.filter(item => {
    // Usamos createdAt para el filtro de tiempo
    const diffDays = (ahora - new Date(item.createdAt)) / (1000 * 60 * 60 * 24)
    return diffDays <= limites[filtroTiempo.value]
  })
})

const metricas = computed(() => {
  const aprobados = datosFiltrados.value.filter(a => a.permissionStatus === 'APPROVED')
  const totalMinutos = aprobados.reduce((acc, curr) => acc + (curr.duration || 0), 0)
  
  return {
    totalSolicitados: datosFiltrados.value.length,
    totalAprobados: aprobados.length,
    horasTotales: (totalMinutos / 60).toFixed(1)
  }
})

// Gráfico Tendencia: Barras (Horas) vs Línea (Cantidad de Permisos)
const dataTendencia = computed(() => {
  const grupos = {}
  datosFiltrados.value.forEach(item => {
    const fecha = new Date(item.createdAt)
    let label = ''

    if (filtroTiempo.value === '1w') {
      label = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
    } else if (filtroTiempo.value === '1m') {
      const sem = Math.ceil(fecha.getDate() / 7)
      label = `Semana ${sem > 4 ? 4 : sem}`
    } else {
      label = fecha.toLocaleDateString('es-ES', { month: 'long' })
    }

    if (!grupos[label]) grupos[label] = { horas: 0, cantidad: 0, ts: fecha.getTime() }
    
    // Solo sumamos horas si está aprobado
    if (item.permissionStatus === 'APPROVED') {
      grupos[label].horas += (item.duration || 0) / 60
    }
    // Contamos todas las solicitudes
    grupos[label].cantidad += 1
  })

  const labelsOrdenados = Object.keys(grupos).sort((a, b) => grupos[a].ts - grupos[b].ts)

  return {
    labels: labelsOrdenados,
    datasets: [
      {
        type: 'line',
        label: 'Cant. Permisos',
        data: labelsOrdenados.map(l => grupos[l].cantidad),
        borderColor: '#f97316',
        backgroundColor: '#f97316',
        borderWidth: 3,
        tension: 0.4,
        yAxisID: 'y1'
      },
      {
        type: 'bar',
        label: 'Horas Aprobadas',
        data: labelsOrdenados.map(l => grupos[l].horas),
        backgroundColor: '#fbbf24aa',
        borderColor: '#fbbf24',
        borderWidth: 1,
        borderRadius: 5,
        yAxisID: 'y'
      }
    ]
  }
})

// Gráfico Empleados por Horas de Permiso
const dataEmpleados = computed(() => {
  const emps = {}
  datosFiltrados.value.forEach(item => {
    if (item.permissionStatus === 'APPROVED') {
      const nombre = `${item.requester.firstName} ${item.requester.lastName}`
      const horas = (item.duration || 0) / 60
      emps[nombre] = (emps[nombre] || 0) + horas
    }
  })

  const sortedEmps = Object.entries(emps).sort((a, b) => b[1] - a[1]).slice(0, 10)

  return {
    labels: sortedEmps.map(e => e[0]),
    datasets: [{
      label: 'Horas Totales',
      data: sortedEmps.map(e => e[1]),
      backgroundColor: '#fbbf24aa', 
      borderColor: '#fbbf24',
      borderWidth: 1,
      borderRadius: 5
    }]
  }
})

const optionsTendencia = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { type: 'linear', position: 'left', title: { display: true, text: 'Horas' } },
    y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'N° Solicitudes' } }
  }
}

const optionsEmpleados = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { title: { display: true, text: 'Horas' } }
  }
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

.status-msg { text-align: center; padding: 3rem; font-size: 1.2rem; }
.status-msg.error { color: #ef4444; background: #fee2e2; border-radius: 8px; }

.dashboard-header { 
  margin-bottom: 0.2rem; 
  display: flex;
  flex-direction: column;
}

.header-top h1 { 
  font-size: 1.8rem; 
  margin-bottom: 1.5rem; 
  margin-top: 0; 
  text-align: center; 
  color: #7c2d12; 
}

.kpi-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr) 200px;
  gap: 1.5rem;
  margin-bottom: 2rem;
  align-items: stretch;
}

.kpi-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.kpi-card .label { 
  color: #64748b; 
  font-size: 0.9rem; 
  font-weight: 500; 
  margin-bottom: 0.5rem; 
}

.kpi-card .value { 
  font-size: 1.75rem; 
  font-weight: 700; 
}

.highlight { border-top: 4px solid #f97316; }

.filter-card { 
  justify-content: center; 
}

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
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chart-panel h3 { 
  margin-bottom: 1.5rem; 
  font-size: 1.1rem; 
  color: #475569; 
  text-align: center; 
}

.chart-container { 
  height: 360px; 
  position: relative; 
}

@media (max-width: 1200px) {
  .kpi-container { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
}
</style>