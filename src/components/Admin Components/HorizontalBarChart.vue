<template>
  <div class="chart-panel">
    <h2>{{ titulo }}</h2>
    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
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
const coloresDegradados = generarDegradado(`#${baseColor}`, props.valores.length)

const chartData = {
  labels: props.labels,
  datasets: [
    {
      label: props.titulo,
      data: props.valores,
      backgroundColor: coloresDegradados
    }
  ]
}

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
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
          size: 14
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
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.chart-panel {
  background-color: #fff7ed;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-family: "Inter", sans-serif;
  max-width: 800px;
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

.chart-container {
  background-color: #fff;
  padding: 0;
  border-radius: 8px;
  border: 1px solid #fdba74;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
  display: flex;
  justify-content: center; /* ← centra horizontalmente */
  align-items: center;     /* ← centra verticalmente si hay espacio */
}


canvas {
  width: 100% !important;
  height: auto !important;
}
</style>


