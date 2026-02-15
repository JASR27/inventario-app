<template>
  <div class="provider-form">
    <h2>Registrar Proveedor</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <div class="form-group">
          <label for="name">Nombre del Proveedor:</label>
          <input 
            type="text" 
            id="name" 
            v-model="provider.name" 
            required 
            placeholder="Ej: Inversiones C.A." 
          />
        </div>

        <div class="form-group">
          <label>Identificación (RIF):</label>
          <div class="rif-composite-input">
            <select v-model="rifParts.type" class="rif-select" @change="calcularDigitoVerificador">
              <option v-for="letra in ['V', 'E', 'J', 'P', 'G']" :key="letra" :value="letra">
                {{ letra }}
              </option>
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
            />
          </div>
          
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

const provider = ref({ name: "" })
const rifParts = reactive({
  type: 'J',
  number: '00000000', // Iniciamos con los 8 ceros
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

// Lógica de desplazamiento (ATM Style)
function handleRifKeyDown(e) {
  // 1. Permitir solo números y Backspace
  const isNumber = /^\d$/.test(e.key)
  const isBackspace = e.key === 'Backspace'

  // Evitar que el input escriba por sí mismo, nosotros controlamos el valor
  e.preventDefault()

  let currentNumber = rifParts.number.replace(/\D/g, '')

  if (isNumber) {
    // Agregar al final y quitar el primero
    currentNumber = (currentNumber + e.key).slice(-8)
  } else if (isBackspace) {
    // Quitar el último y agregar un cero al principio
    currentNumber = ('0' + currentNumber).slice(0, 8)
    currentNumber = currentNumber.substring(0, 7).padStart(8, '0') 
    // Simplificado: quitamos el último carácter y ponemos un 0 delante
    currentNumber = currentNumber.slice(0, -1).padStart(8, '0')
  }

  rifParts.number = currentNumber
  calcularDigitoVerificador()
}

async function handleSubmit() {
  const nameRegex = /^[A-Za-z0-9 ._-]{6,50}$/
  if (!nameRegex.test(provider.value.name)) {
    return notificationStore.addNotification("Nombre Inválido", "Debe tener entre 6 y 50 caracteres.", "warning")
  }

  const rifFinal = `${rifParts.type}-${rifParts.number}-${rifParts.verifier}`

  try {
    const response = await fetch("http://localhost:8080/supplier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: provider.value.name.trim(), nid: rifFinal })
    });

    if (!response.ok) {
      if (response.status === 409) return notificationStore.addNotification("Duplicado", "El RIF ya existe.", "warning");
      throw new Error();
    }
    
    notificationStore.addNotification("Éxito", `Proveedor registrado: ${rifFinal}.`, "success");
    resetForm();
  } catch (error) {
    notificationStore.addNotification("Error", "Fallo en el servidor.", "error");
  }
}

function resetForm() {
  provider.value.name = ""
  rifParts.type = 'J'
  rifParts.number = '00000000'
  rifParts.verifier = ''
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.provider-form {
  background-color: #f0fdf4;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Inter", sans-serif;
  max-width: 600px; /* Igualado a la vista de cliente */
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.provider-form h2 {
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

.provider-form label {
  font-weight: 600;
  color: #065f46;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

/* Inputs Unificados */
.provider-form input[type="text"] {
  padding: 0.75rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  transition: border-color 0.3s ease;
}

.provider-form input:focus {
  outline: none;
  border-color: #34d399;
}

/* Contenedor RIF Unificado */
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

.rif-input-verifier.readonly-field {
  width: 30px;
  text-align: center;
  font-weight: 700;
  cursor: default;
}

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
  transition: opacity 0.2s;
}

button[type="submit"] { background-color: #10b981; color: white; }
button[type="button"] { background-color: #d1fae5; color: #065f46; }

button:hover { opacity: 0.9; }
</style>