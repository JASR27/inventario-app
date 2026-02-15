<template>
  <div class="user-form">
    <h2>Registrar Usuario</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <div class="form-group">
          <label for="firstName">Primer Nombre:</label>
          <input type="text" id="firstName" v-model="user.firstName" required placeholder="Ej: Juan" />
        </div>

        <div class="form-group">
          <label for="lastName">Primer Apellido:</label>
          <input type="text" id="lastName" v-model="user.lastName" required placeholder="Ej: Pérez" />
        </div>

        <div class="form-group">
          <label>Identificación (NID):</label>
          <div class="nid-composite-input">
            <select v-model="nidParts.type" class="nid-select" @change="calcularDigitoVerificador">
              <option v-for="letra in ['V', 'E', 'P']" :key="letra" :value="letra">
                {{ letra }}
              </option>
            </select>
            
            <span class="nid-separator">-</span>

            <input 
              type="text" 
              :value="nidParts.number" 
              @keydown="handleNidKeyDown"
              placeholder="00000000" 
              class="nid-input-body"
            />

            <span class="nid-separator">-</span>

            <input 
              type="text" 
              :value="nidParts.verifier" 
              readonly
              placeholder="?" 
              class="nid-input-verifier readonly-field"
            />
          </div>
          
        </div>

        <div class="form-group">
          <label for="username">Usuario:</label>
          <input type="text" id="username" v-model="user.username" required placeholder="juan.perez" />
        </div>

        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" v-model="user.password" required placeholder="********" />
        </div>

        <div class="form-group">
          <label for="role">Rol:</label>
          <select id="role" v-model="user.role" required class="full-select">
            <option value="" disabled>Selecciona un rol</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      <div class="button-group">
        <button type="button" class="btn-limpiar" @click="resetForm">Limpiar</button>
        <button type="submit" class="btn-registrar">Registrar</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useNotificationStore } from '../../store/useNotificationStore.js'

const notificationStore = useNotificationStore()

const user = ref({
  firstName: "",
  lastName: "",
  username: "",
  password: "",
  role: "",
})

const nidParts = reactive({
  type: 'V',
  number: '00000000',
  verifier: ''
})

const letraValores = { V: 1, E: 2, J: 3, P: 4, G: 5 }
const pesos = [4, 3, 2, 7, 6, 5, 4, 3, 2]

function calcularDigitoVerificador() {
  const numStr = nidParts.number
  const valorLetra = letraValores[nidParts.type]
  const digitos = [valorLetra, ...numStr.split('').map(Number)]
  
  let sumaTotal = 0
  for (let i = 0; i < 9; i++) {
    sumaTotal += digitos[i] * pesos[i]
  }
  
  const residuo = sumaTotal % 11
  let resultado = 11 - residuo
  nidParts.verifier = (resultado >= 10) ? '0' : resultado.toString()
}

function handleNidKeyDown(e) {
  const isNumber = /^\d$/.test(e.key)
  const isBackspace = e.key === 'Backspace'

  e.preventDefault()

  let currentNumber = nidParts.number.replace(/\D/g, '')

  if (isNumber) {
    currentNumber = (currentNumber + e.key).slice(-8)
  } else if (isBackspace) {
    currentNumber = currentNumber.slice(0, -1).padStart(8, '0')
  }

  nidParts.number = currentNumber
  calcularDigitoVerificador()
}

async function handleSubmit() {
  // Validaciones de Regex (Front-end)
  const nameRegex = /^[A-Za-z ]{4,20}$/
  const usernameRegex = /^[A-Za-z0-9._-]{6,20}$/

  if (!nameRegex.test(user.value.firstName) || !nameRegex.test(user.value.lastName)) {
    return notificationStore.addNotification("Dato Inválido", "Nombre/Apellido deben tener entre 4 y 20 letras.", "warning")
  }

  const nidFinal = `${nidParts.type}-${nidParts.number}-${nidParts.verifier}`

  const payload = {
    ...user.value,
    nid: nidFinal,
    role: user.value.role.toUpperCase()
  }

  try {
    const response = await fetch("http://localhost:8080/employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorMsg = await response.text()
      if (response.status === 409) return notificationStore.addNotification("Conflicto", errorMsg, "warning")
      throw new Error()
    }
    
    notificationStore.addNotification("Éxito", `Usuario ${user.value.username} registrado.`, "success")
    resetForm()
  } catch (error) {
    notificationStore.addNotification("Error", "Fallo al conectar con el servidor.", "error")
  }
}

function resetForm() {
  user.value = { firstName: "", lastName: "", username: "", password: "", role: "" }
  nidParts.type = 'V'
  nidParts.number = '00000000'
  nidParts.verifier = ''
  notificationStore.addNotification("Formulario Limpio", "Los datos han sido reiniciados.", "info")
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.user-form {
  background-color: #fff7ed; /* Naranja muy claro */
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Inter", sans-serif;
  max-width: 700px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-form h2 {
  font-size: 1.5rem;
  color: #7c2d12; /* Marrón/Naranja oscuro */
  text-align: center;
  margin-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.user-form label {
  font-weight: 600;
  color: #9a3412;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

/* Inputs y Selects */
.user-form input, .user-form select.full-select {
  padding: 0.75rem;
  border: 1px solid #fdba74;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  transition: border-color 0.3s ease;
}

.user-form input:focus, .user-form select:focus {
  outline: none;
  border-color: #fb923c;
}

/* Estructura NID Unificada (Copia de la estética de Proveedor) */
.nid-composite-input {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #fdba74;
  border-radius: 8px;
  padding: 0 0.75rem;
}

.nid-composite-input:focus-within {
  border-color: #fb923c;
}

.nid-select {
  border: none;
  background: transparent;
  padding: 0.75rem 0;
  color: #9a3412;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.nid-separator {
  color: #fdba74;
  font-weight: bold;
  margin: 0 8px;
}

.nid-input-body, .nid-input-verifier {
  border: none !important;
  outline: none !important;
  background: transparent;
  padding: 0.75rem 0;
}

.nid-input-body { flex: 1; }

.nid-input-verifier.readonly-field {
  width: 30px;
  text-align: center;
  font-weight: 700;
  color: #595959;
}

.nid-helper {
  margin-top: 5px;
  font-size: 0.75rem;
  color: #c2410c;
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
  transition: opacity 0.2s;
}

.btn-registrar { background-color: #f97316; color: white; }
.btn-limpiar { background-color: #fcd34d;
  color: #78350f; }

button:hover { opacity: 0.9; }

/* Responsive */
@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>