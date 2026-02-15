<template>
  <div class="usuario-manager" :class="{ 'bg-blanco': !mostrarTabla }">
    <div class="tabla-formulario">

      <div class="tabla-contenedor" v-if="mostrarTabla">
        <div class="header">
          <h2>Lista de Usuarios</h2>
        </div>

        <div class="toolbar-tabla">
          <div class="control-group">
            <label>Buscar por:</label>
            <select v-model="campoBusqueda" class="select-input-toolbar">
              <option value="todos">Todos los campos</option>
              <option value="firstName">Nombre</option>
              <option value="lastName">Apellido</option>
              <option value="nid">NID</option>
              <option value="username">Usuario</option>
              <option value="role">Rol</option>
            </select>
            <input type="text" v-model="busqueda" :placeholder="placeholderBusqueda" class="search-input-toolbar" />
          </div>

          <div class="control-group">
            <label>Ordenar por:</label>
            <select v-model="criterioOrden" class="select-input-toolbar">
              <option value="firstName">Nombre</option>
              <option value="lastName">Apellido</option>
              <option value="nid">NID</option>
              <option value="role">Rol</option>
            </select>
            <button @click="ordenAscendente = !ordenAscendente" class="btn-orden-tabla">
              {{ ordenAscendente ? 'Ascendente ▲' : 'Descendente ▼' }}
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Primer Nombre</th>
              <th>Primer Apellido</th>
              <th>NID</th>
              <th>Usuario</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuariosFiltradosYOrdenados" :key="usuario.nid" @click="seleccionar(usuario)">
              <td>{{ usuario.firstName }}</td>
              <td>{{ usuario.lastName }}</td>
              <td>{{ usuario.nid }}</td>
              <td>{{ usuario.username }}</td>
              <td>
                <span :class="['badge-rol', usuario.role.toLowerCase()]">
                  {{ usuario.role }}
                </span>
              </td>
            </tr>
            <tr v-if="usuariosFiltradosYOrdenados.length === 0">
              <td colspan="5" style="text-align: center; padding: 2rem; opacity: 0.6;">
                No se encontraron usuarios
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="user-form" v-if="mostrarFormulario">
        <h2>Editar Usuario</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div class="form-group">
              <label for="firstName">Primer Nombre:</label>
              <input type="text" id="firstName" v-model="user.firstName" required />
            </div>

            <div class="form-group">
              <label for="lastName">Primer Apellido:</label>
              <input type="text" id="lastName" v-model="user.lastName" required />
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
                <input type="text" :value="nidParts.number" @keydown="handleNidKeyDown" class="nid-input-body" />
                <span class="nid-separator">-</span>
                <input type="text" :value="nidParts.verifier || '?'" readonly class="nid-input-verifier readonly-field"
                  :class="{ 'placeholder-verifier': !nidParts.verifier }" />
              </div>
            </div>

            <div class="form-group">
              <label for="username">Usuario:</label>
              <input type="text" id="username" v-model="user.username" required />
            </div>

            <div class="form-group">
              <label for="password">Nueva Contraseña:</label>
              <input type="password" id="password" v-model="user.password"
                placeholder="Dejar en blanco para no cambiar" />
            </div>

            <div class="form-group">
              <label for="role">Rol:</label>
              <select id="role" v-model="user.role" required class="full-select">
                <option value="" disabled>Selecciona un rol</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div class="button-group">
            <button type="button" @click="mostrarTabla = true; mostrarFormulario = false"
              class="btn-regresar">Regresar</button>
            <button type="button" @click="resetForm" class="btn-limpiar">Limpiar</button>
            <button type="submit" class="btn-editar">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useNotificationStore } from '../../store/useNotificationStore.js';

const notificationStore = useNotificationStore();

// --- ESTADOS ---
const usuarios = ref([])
const busqueda = ref('')
const campoBusqueda = ref('todos')
const criterioOrden = ref('firstName')
const ordenAscendente = ref(true)
const mostrarTabla = ref(true)
const mostrarFormulario = ref(false)

const user = ref({
  id: null, firstName: '', lastName: '', nid: '', username: '', password: '', role: ''
})

// Lógica NID
const nidParts = reactive({ type: 'V', number: '00000000', verifier: '' })
const letraValores = { V: 1, E: 2, J: 3, P: 4, G: 5 }
const pesos = [4, 3, 2, 7, 6, 5, 4, 3, 2]

// --- LÓGICA NID ---
function calcularDigitoVerificador() {
  const numStr = nidParts.number
  const valorLetra = letraValores[nidParts.type]
  const digitos = [valorLetra, ...numStr.split('').map(Number)]
  let sumaTotal = 0
  for (let i = 0; i < 9; i++) { sumaTotal += digitos[i] * pesos[i] }
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

// --- ACCIONES ---
onMounted(() => cargarUsuarios())

const cargarUsuarios = async () => {
  try {
    const res = await fetch('http://localhost:8080/employee')
    if (!res.ok) throw new Error();
    usuarios.value = await res.json()
  } catch (err) {
    notificationStore.addNotification("Error", "No se pudo cargar la lista.", "error")
  }
}

function seleccionar(usuario) {
  // 1. Cargar datos básicos
  user.value = { ...usuario, role: usuario.role.toLowerCase() }

  // 2. Descomponer NID (Ej: "V-01234567-8")
  const partes = usuario.nid.split('-')
  if (partes.length === 3) {
    nidParts.type = partes[0]
    nidParts.number = partes[1]
    nidParts.verifier = partes[2]
  }

  mostrarTabla.value = false
  mostrarFormulario.value = true
}

async function handleSubmit() {
  const nidFinal = `${nidParts.type}-${nidParts.number}-${nidParts.verifier}`
  const payload = { ...user.value, nid: nidFinal, role: user.value.role.toUpperCase() }

  try {
    const res = await fetch(`http://localhost:8080/employee/${user.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const msg = await res.text()
      return notificationStore.addNotification("Error", msg || "Error al actualizar", "error")
    }

    notificationStore.addNotification("Éxito", "Usuario actualizado correctamente", "success")
    mostrarFormulario.value = false
    mostrarTabla.value = true
    await cargarUsuarios()
  } catch (err) {
    notificationStore.addNotification("Error", "Sin conexión con el servidor", "error")
  }
}

function resetForm() {
  user.value = { id: user.value.id, firstName: '', lastName: '', username: '', password: '', role: '' }
  nidParts.type = 'V'; nidParts.number = '00000000'; nidParts.verifier = ''
}

// --- COMPUTED PARA TABLA ---
const placeholderBusqueda = computed(() => {
  const ops = { todos: 'Buscar...', firstName: 'Nombre...', lastName: 'Apellido...', nid: 'NID...', username: 'Usuario...', role: 'Rol...' }
  return ops[campoBusqueda.value]
})

const usuariosFiltradosYOrdenados = computed(() => {
  let filtrados = usuarios.value.filter(u => {
    const texto = busqueda.value.toLowerCase().trim()
    if (!texto) return true
    const campos = [u.firstName, u.lastName, u.username, u.nid, u.role].map(v => (v || '').toLowerCase())
    if (campoBusqueda.value !== 'todos') return (u[campoBusqueda.value] || '').toLowerCase().includes(texto)
    return campos.some(c => c.includes(texto))
  })
  filtrados.sort((a, b) => {
    let vA = (a[criterioOrden.value] || '').toString().toLowerCase()
    let vB = (b[criterioOrden.value] || '').toString().toLowerCase()
    return ordenAscendente.value ? vA.localeCompare(vB) : vB.localeCompare(vA)
  })
  return filtrados
})
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap");

/* --- BASES Y ANIMACIÓN DE FONDO --- */
* {
  font-family: "Inter", sans-serif;
  box-sizing: border-box;
}

.usuario-manager {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  background-color: #fffaf0; /* Fondo crema (Tabla) */
  padding: 2rem;
  min-height: 100vh;
  transition: background-color 0.4s ease; /* Transición suave */
}

/* Clase activada al ocultar la tabla */
.bg-blanco {
  background-color: #ffffff !important;
}

.tabla-formulario {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

/* --- BADGES DE ROL (Más definidos) --- */
.badge-rol {

  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.badge-rol.admin {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-rol.user {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-rol.terminated {
  background-color: #fee2e2;
  color: #991b1b;
}

/* --- TOOLBAR --- */
.toolbar-tabla {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  background-color: #ffffff;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.control-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #9a3412;
}

.select-input-toolbar,
.search-input-toolbar {
  padding: 0.6rem;
  border: 1px solid #fdba74;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input-toolbar:focus {
  border-color: #f97316;
}

.btn-orden-tabla {
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.btn-orden-tabla:hover {
  background-color: #ea580c;
}

/* --- TABLA --- */
.tabla-contenedor {
  max-width: 1000px;
  width: 100%;
}

.header h2 {
  color: #7c2d12;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
}

table {
  background-color: #ffffff;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
}

thead {
  background-color: #fdba74;
  color: #78350f;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.9rem;
}

td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.95rem;
  color: #4b5563;
}

tbody tr:hover {
  background-color: #fff1e0;
  cursor: pointer;
}

/* --- FORMULARIO --- */
.user-form {
  background-color: #fff7ed; /* Color crema suave para el card */
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  max-width: 750px;
  width: 100%;
  border: 1px solid #ffedd5;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-form h2 {
  color: #7c2d12;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
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
  margin-bottom: 0.6rem;
  font-size: 0.85rem;
}

.user-form input:not(.nid-input-body):not(.nid-input-verifier),
.user-form select.full-select {
  padding: 0.8rem;
  border: 1px solid #fdba74;
  border-radius: 10px;
  font-size: 0.95rem;
  background-color: #fff;
  outline: none;
  transition: all 0.2s;
}



/* --- NID COMPOSITE --- */
.nid-composite-input {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #fdba74;
  border-radius: 10px;
  padding: 0 1rem;
  transition: all 0.2s;
}



.nid-select {
  border: none !important;
  background: transparent !important;
  padding: 0.8rem 0;
  color: #9a3412;
  font-weight: 700;
  outline: none !important;
  cursor: pointer;
}

.nid-input-body {
  border: none !important;
  outline: none !important;
  background: transparent;
  padding: 0.8rem 0;
  flex: 1;
  font-weight: 600;
}

.nid-input-verifier {
  border: none !important;
  outline: none !important;
  background: transparent;
  padding: 0.8rem 0;
  width: 35px;
  text-align: center;
  font-weight: 800;
  color: #595959;
}

.nid-separator {
  color: #fdba74;
  font-weight: bold;
  margin: 0 10px;
}

/* --- BOTONES --- */
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
  margin-top: 2.5rem;
}

.btn-editar {
  background-color: #f97316;
  color: white;
  padding: 0.8rem 2rem;
}

.btn-editar:hover {
  background-color: #ea580c;
}

.btn-limpiar, .btn-regresar { background-color: #fcd34d;
  color: #78350f; }

button:hover { opacity: 0.9; }

button {
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: transform 0.1s, background 0.2s;
}

button:active {
  transform: scale(0.98);
}

@media (max-width: 900px) {
  .form-grid { grid-template-columns: 1fr; }
  .toolbar-tabla { flex-direction: column; align-items: stretch; }
  .control-group { justify-content: space-between; }
}
</style>