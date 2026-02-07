<template>
  <div class="attendance-form">
    <h2>Bienvenido, {{ usuario }}</h2>

    <button
      v-if="estado === 'entrada'"
      @click="registrarEntrada"
      class="btn-entrada"
    >
      Registrar Entrada
    </button>

    <button
      v-else
      @click="registrarSalida"
      class="btn-salida"
    >
      Registrar Salida
    </button>

    <div v-if="horaEntrada" class="registro-info">
      <p><strong>Entrada registrada:</strong> {{ horaEntrada }}</p>
      <p><strong>Tiempo trabajado:</strong> {{ tiempoTranscurrido }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Utilidades para cookies
function getCookie(nombre) {
  const cookies = document.cookie.split(';')
  for (let c of cookies) {
    const [key, val] = c.trim().split('=')
    if (key === nombre) return val
  }
  return null
}

function setCookie(nombre, valor, dias = 1) {
  const fecha = new Date()
  fecha.setTime(fecha.getTime() + (dias * 24 * 60 * 60 * 1000))
  document.cookie = `${nombre}=${valor};expires=${fecha.toUTCString()};path=/`
}

function borrarCookie(nombre) {
  document.cookie = `${nombre}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

// Estado reactivo
const usuario = getCookie('usuario') || 'Invitado'
const userId = parseInt(getCookie('userid')) || null
const estado = ref('entrada')
const horaEntrada = ref(null)
const entradaTimestamp = ref(null)
const tiempoTranscurrido = ref('00h 00m 00s')
let intervalo = null

// Registrar entrada
function registrarEntrada() {
  if (getCookie(`estado_${usuario}`) === 'salida') {
    alert('Ya existe una entrada registrada para este usuario.')
    return
  }

  const ahora = new Date()
  horaEntrada.value = ahora.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
  entradaTimestamp.value = ahora.getTime()
  estado.value = 'salida'
  iniciarTemporizador()

  setCookie(`estado_${usuario}`, 'salida')
  setCookie(`horaEntrada_${usuario}`, horaEntrada.value)
  setCookie(`entradaTimestamp_${usuario}`, entradaTimestamp.value)
}

// Registrar salida y enviar POST
async function registrarSalida() {
  detenerTemporizador()
  const salidaTimestamp = new Date().getTime()
  const diferenciaMs = salidaTimestamp - entradaTimestamp.value
  const minutos = Math.floor(diferenciaMs / 60000)
  const horas = Math.floor(minutos / 60)
  const minutosRestantes = minutos % 60

  alert(`Tiempo total trabajado: ${horas}h ${minutosRestantes}min`)

  const payload = {
    startTime: new Date(entradaTimestamp.value).toISOString(),
    hours: horas,
    user: {
      id: userId
    }
  }

  try {
    const response = await fetch('http://localhost:8080/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error('Error al registrar asistencia')
    }

    console.log('Registro enviado correctamente')
  } catch (error) {
    console.error('Error en el envío:', error)
    alert('Hubo un problema al registrar la asistencia.')
  }

  estado.value = 'entrada'
  horaEntrada.value = null
  entradaTimestamp.value = null
  tiempoTranscurrido.value = '00h 00m 00s'

  borrarCookie(`estado_${usuario}`)
  borrarCookie(`horaEntrada_${usuario}`)
  borrarCookie(`entradaTimestamp_${usuario}`)
}

// Temporizador en tiempo real
function iniciarTemporizador() {
  detenerTemporizador()
  intervalo = setInterval(() => {
    const ahora = new Date().getTime()
    const diferencia = ahora - entradaTimestamp.value
    const horas = Math.floor(diferencia / 3600000)
    const minutos = Math.floor((diferencia % 3600000) / 60000)
    const segundos = Math.floor((diferencia % 60000) / 1000)
    tiempoTranscurrido.value = `${horas.toString().padStart(2, '0')}h ${minutos.toString().padStart(2, '0')}m ${segundos.toString().padStart(2, '0')}s`
  }, 1000)
}

function detenerTemporizador() {
  if (intervalo) {
    clearInterval(intervalo)
    intervalo = null
  }
}

// Restaurar estado si hay cookies previas
onMounted(() => {
  const estadoGuardado = getCookie(`estado_${usuario}`)
  const horaGuardada = getCookie(`horaEntrada_${usuario}`)
  const timestampGuardado = getCookie(`entradaTimestamp_${usuario}`)

  if (estadoGuardado === 'salida' && horaGuardada && timestampGuardado) {
    estado.value = 'salida'
    horaEntrada.value = horaGuardada
    entradaTimestamp.value = parseInt(timestampGuardado)
    iniciarTemporizador()
  }
})

onUnmounted(() => {
  detenerTemporizador()
})
</script>

<style scoped>
.attendance-form {
  background-color: #f0fdf4;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Inter", sans-serif;
  max-width: 500px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: center;
}

.attendance-form h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #166534;
}

.attendance-form .registro-info {
  font-size: 1.1rem;
  color: #065f46;
  background-color: #d1fae5;
  padding: 0.75rem 1rem;
  border-left: 4px solid #34d399;
  border-radius: 8px;
  margin-top: 1rem;
}

button {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: 1rem;
}

button.btn-entrada {
  background-color: #10b981;
  color: white;
}

button.btn-entrada:hover {
  background-color: #059669;
}

button.btn-salida {
  background-color: #e5e7eb;
  color: #374151;
}

button.btn-salida:hover {
  background-color: #d1d5db;
}
</style>

