<template>
  <div class="chart-panel">
    <h2>{{ titulo }}</h2>

    <!-- Barra de filtros de tiempo -->
    <div class="time-filter-bar">
      <button 
        v-for="opcion in opcionesTiempo" 
        :key="opcion.valor" 
        :class="{ activo: filtroTiempo === opcion.valor }"
        @click="cambiarFiltro(opcion.valor)"
      >
        {{ opcion.label }}
      </button>
    </div>

    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  labels: Array,
  valores: Array,
  titulo: String,
  color: String
})

// Opciones de tiempo
const opcionesTiempo = [
  { label: 'Última semana', valor: '1w' },
  { label: 'Último mes', valor: '1m' },
  { label: 'Últimos 3 meses', valor: '3m' },
  { label: 'Últimos 6 meses', valor: '6m' }
]

const filtroTiempo = ref('1m')

// Genera degradado por posición
function generarDegradado(baseColor, total) {
  const colores = []
  for (let i = 0; i < total; i++) {
    const opacidad = 1 - i / (total * 1.2)
    const hexOpacidad = Math.round(opacidad * 255).toString(16).padStart(2, '0')
    colores.push(`${baseColor}${hexOpacidad}`)
  }
  return colores
}

const baseColor = props.color?.replace('#', '') || 'f97316'

// Filtrado dinámico de datos según margen de tiempo
const datosFiltrados = computed(() => {
  let cantidad = props.valores.length
  switch (filtroTiempo.value) {
    case '1w':
      cantidad = Math.min(7, props.valores.length)
      break
    case '1m':
      cantidad = Math.min(30, props.valores.length)
      break
    case '3m':
      cantidad = Math.min(90, props.valores.length)
      break
    case '6m':
      cantidad = Math.min(180, props.valores.length)
      break
  }
  return {
    labels: props.labels.slice(-cantidad),
    valores: props.valores.slice(-cantidad)
  }
})

const coloresDegradados = computed(() =>
  generarDegradado(`#${baseColor}`, datosFiltrados.value.valores.length)
)

const chartData = computed(() => ({
  labels: datosFiltrados.value.labels,
  datasets: [
    {
      label: props.titulo,
      data: datosFiltrados.value.valores,
      backgroundColor: coloresDegradados.value
    }
  ]
}))

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 30, // más espacio arriba para texto
      bottom: 20,
      left: 20,
      right: 20
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        color: '#7c2d12',
        font: {
          family: 'Inter',
          weight: '600',
          size: 12
        }
      }
    },
    y: {
      ticks: {
        color: '#7c2d12',
        font: {
          family: 'Inter',
          weight: '600',
          size: 12
        }
      }
    }
  },
  elements: {
    bar: {
      minBarLength: 30
    }
  },
  plugins: {
    legend: { display: false },
    title: { display: false }
  }
}

function cambiarFiltro(valor) {
  filtroTiempo.value = valor
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.chart-panel {
  background-color: #fff7ed;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-family: "Inter", sans-serif;
  max-width: 900px; /* más ancho para texto */
  width: 100%;
  margin: 0 auto 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-panel h2 {
  font-size: 1.5rem;
  color: #7c2d12;
  margin-bottom: 1rem;
  text-align: center;
}

/* Barra de filtros */
.time-filter-bar {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.time-filter-bar button {
  background-color: #fdba74;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-family: "Inter", sans-serif;
  font-weight: 600;
  color: #7c2d12;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.time-filter-bar button:hover {
  background-color: #fb923c;
}

.time-filter-bar button.activo {
  background-color: #f97316;
  color: #fff;
}

.chart-container {
  background-color: #fff;
  padding: 1rem; /* más espacio interno */
  border-radius: 8px;
  border: 1px solid #fdba74;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  width: 80%;
  display: flex;
  margin: auto;
  justify-content: center;
  align-items: center;
}

canvas {
  width: 100% !important;
  height: auto !important;
}
</style>


