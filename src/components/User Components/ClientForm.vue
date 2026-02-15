<template>
  <div class="client-form">
    <h2>Registrar Cliente</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <div class="form-group">
          <label for="fullName">Nombre Completo:</label>
          <input type="text" id="fullName" v-model="client.fullName" required placeholder="Ej: Juan Pérez" />
        </div>

        <div class="form-group">
          <label>Identificación (RIF):</label>
          <div class="rif-composite-input">
            <select v-model="rifParts.type" class="rif-select" @change="calcularDigitoVerificador">
              <option value="V">V (Venezolano)</option>
              <option value="E">E (Extranjero)</option>
              <option value="P">P (Pasaporte)</option>
              <option value="J">J (Jurídico)</option>
              <option value="G">G (Gubernamental)</option>
            </select>
            
            <span class="rif-separator">-</span>

            <input 
              type="text" 
              :value="rifParts.number" 
              @keydown="handleRifKeyDown"
              placeholder="00000000" 
              class="rif-input-body"
            />

            <span class="rif-separator">-</span>

            <input 
              type="text" 
              :value="rifParts.verifier" 
              readonly
              placeholder="?" 
              class="rif-input-verifier readonly-field"
              title="Calculado automáticamente"
            />
          </div>
          <small class="rif-helper">Escriba los números; se desplazarán de derecha a izquierda.</small>
        </div>

        <div class="form-group">
          <label for="address">Dirección:</label>
          <input type="text" id="address" v-model="client.address" required placeholder="Ej: Av. Principal..."></input>
        </div>
      </div>

      <div class="button-group">
        <button type="button" @click="resetForm">Limpiar</button>
        <button type="submit">Registrar</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useNotificationStore } from '../../store/useNotificationStore.js'

const notificationStore = useNotificationStore()

const client = ref({ fullName: "", address: "" })
const rifParts = reactive({
  type: 'V',
  number: '00000000', // Iniciamos con el formato lleno
  verifier: ''
})

const letraValores = { V: 1, E: 2, J: 3, P: 4, G: 5 }
const pesos = [4, 3, 2, 7, 6, 5, 4, 3, 2]

function calcularDigitoVerificador() {
  const numStr = rifParts.number
  const valorLetra = letraValores[rifParts.type]
  const digitos = [valorLetra, ...numStr.split('').map(Number)]
  
  let sumaTotal = 0
  for (let i = 0; i < 9; i++) {
    sumaTotal += digitos[i] * pesos[i]
  }
  
  const residuo = sumaTotal % 11
  let resultado = 11 - residuo
  
  rifParts.verifier = (resultado >= 10) ? '0' : resultado.toString()
}

// Lógica ATM: Desplazamiento de derecha a izquierda
function handleRifKeyDown(e) {
  const isNumber = /^\d$/.test(e.key)
  const isBackspace = e.key === 'Backspace'

  // Bloqueamos la escritura nativa para procesarla manualmente
  if (isNumber || isBackspace) {
    e.preventDefault()
  } else if (e.key !== 'Tab') {
    return // Permitir Tab para navegación
  }

  let currentNumber = rifParts.number.replace(/\D/g, '')

  if (isNumber) {
    // Añade al final y mantiene los últimos 8
    currentNumber = (currentNumber + e.key).slice(-8)
  } else if (isBackspace) {
    // Borra el último y rellena con un cero a la izquierda
    currentNumber = currentNumber.slice(0, -1).padStart(8, '0')
  }

  rifParts.number = currentNumber
  calcularDigitoVerificador()
}

async function handleSubmit() {
  // Verificamos que no sea solo ceros antes de enviar
  if (rifParts.number === '00000000' || !rifParts.verifier) {
    return notificationStore.addNotification("Error", "Debe completar el número de identificación", "error")
  }

  const rifFinal = `${rifParts.type}-${rifParts.number}-${rifParts.verifier}`

  try {
    const response = await fetch("http://localhost:8080/client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        fullName: client.value.fullName, 
        nid: rifFinal, 
        address: client.value.address 
      })
    })

    if (!response.ok) {
      if (response.status === 409) {
        return notificationStore.addNotification("Registro Duplicado", "Este cliente ya existe.", "warning")
      }
      throw new Error()
    }

    notificationStore.addNotification("Éxito", `Cliente registrado con RIF: ${rifFinal}`, "success")
    resetForm()
  } catch (error) {
    notificationStore.addNotification("Error", "Hubo un problema con el servidor.", "error")
  }
}

function resetForm() {
  client.value = { fullName: "", address: "" }
  rifParts.type = 'V'
  rifParts.number = '00000000'
  rifParts.verifier = ''
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.client-form {
  background-color: #f0fdf4;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Inter", sans-serif;
  max-width: 600px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.client-form h2 {
  font-size: 1.5rem;
  color: #166534;
  text-align: center;
  margin-bottom: 0.5rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.client-form label {
  font-weight: 600;
  color: #065f46;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

/* Input General */
.client-form input[type="text"],
.client-form textarea {
  padding: 0.75rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  transition: border-color 0.3s ease;
}

/* Contenedor RIF/Cédula */
.rif-composite-input {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  padding: 0 0.75rem;
}

.rif-composite-input:focus-within {
  border-color: #34d399;
}

.rif-select {
  border: none;
  background: transparent;
  padding: 0.75rem 0;
  color: #065f46;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  outline: none;
  cursor: pointer;
}

.rif-separator {
  color: #a7f3d0;
  font-weight: bold;
  margin: 0 8px;
}

.rif-input-body, .rif-input-verifier {
  border: none !important;
  outline: none !important;
  background: transparent;
  padding: 0.75rem 0;
}

.rif-input-body { flex: 1; text-align: left; }
.rif-input-verifier { width: 30px; text-align: center; font-weight: 600; }

.rif-helper {
  margin-top: 5px;
  font-size: 0.75rem;
  color: #166534;
  font-style: italic;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-family: "Inter", sans-serif;
}

button[type="submit"] { background-color: #10b981; color: white; }
button[type="button"] { background-color: #d1fae5; color: #065f46; }

button:hover { opacity: 0.9; }
</style>
