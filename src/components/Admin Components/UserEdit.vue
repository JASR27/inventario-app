<template>
  <div class="usuario-manager">

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
              <td>{{ usuario.role }}</td>
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
        <h2>Formulario de Usuario</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div class="form-group">
              <label for="firstName">Primer Nombre:</label>
              <input type="text" id="firstName" v-model="user.firstName" required minlength="4" maxlength="20"
                pattern="[A-Za-z ]{4,20}" title="Debe tener entre 4 y 20 caracteres." />
            </div>

            <div class="form-group">
              <label for="lastName">Primer Apellido:</label>
              <input type="text" id="lastName" v-model="user.lastName" required minlength="6" maxlength="20"
                pattern="[A-Za-z ]{4,20}" title="Debe tener entre 4 y 20 caracteres." />
            </div>

            <div class="form-group">
              <label for="nid">NID:</label>
              <input type="text" id="nid" v-model="user.nid" required minlength="6" maxlength="20"
                pattern="[A-Za-z0-9._-]{6,20}" title="Debe tener entre 6 y 20 caracteres." />
            </div>

            <div class="form-group">
              <label for="username">Usuario:</label>
              <input type="text" id="username" v-model="user.username" required minlength="6" maxlength="20"
                pattern="[A-Za-z0-9._-]{6,20}" title="Debe tener entre 6 y 20 caracteres." />
            </div>

            <div class="form-group">
              <label for="password">Contraseña:</label>
              <input type="password" id="password" v-model="user.password" required minlength="6" maxlength="20"
                pattern="[A-Za-z0-9._\\-#$&*@]{6,20}" />
            </div>

            <div class="form-group">
              <label for="role">Rol:</label>
              <select id="role" v-model="user.role" required>
                <option value="" disabled>Selecciona un rol</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div class="button-group">
            <button type="button" @click="mostrarTabla = true; mostrarFormulario = false"
              class="toggle-button">Regresar</button>
            <button type="button" @click="resetForm">Limpiar</button>
            <button type="submit">Editar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '../../store/useNotificationStore.js';

const notificationStore = useNotificationStore();

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

// --- CARGA INICIAL ---
onMounted(() => {
  cargarUsuarios();
})

const cargarUsuarios = async () => {
  try {
    const res = await fetch('http://localhost:8080/employee')
    if (!res.ok) throw new Error("Error al obtener la lista");
    const data = await res.json()
    usuarios.value = data
  } catch (err) {
    console.error(err)
    notificationStore.addNotification(
      "Error de Carga", 
      "No se pudo sincronizar la lista de usuarios con el servidor.", 
      "error"
    );
  }
}

const placeholderBusqueda = computed(() => {
  const ops = { todos: 'Buscar...', firstName: 'Nombre...', lastName: 'Apellido...', nid: 'NID...', username: 'Usuario...', role: 'Rol...' }
  return ops[campoBusqueda.value]
})

const usuariosFiltradosYOrdenados = computed(() => {
  let filtrados = usuarios.value.filter(u => {
    const texto = busqueda.value.toLowerCase().trim()
    if (!texto) return true

    const mFN = (u.firstName || '').toLowerCase().includes(texto)
    const mLN = (u.lastName || '').toLowerCase().includes(texto)
    const mUN = (u.username || '').toLowerCase().includes(texto)
    const mNID = (u.nid || '').toLowerCase().includes(texto)
    const mRL = (u.role || '').toLowerCase().includes(texto)

    if (campoBusqueda.value === 'firstName') return mFN
    if (campoBusqueda.value === 'lastName') return mLN
    if (campoBusqueda.value === 'username') return mUN
    if (campoBusqueda.value === 'nid') return mNID
    if (campoBusqueda.value === 'role') return mRL
    return mFN || mLN || mUN || mNID || mRL
  })

  filtrados.sort((a, b) => {
    let vA = (a[criterioOrden.value] || '').toString().toLowerCase()
    let vB = (b[criterioOrden.value] || '').toString().toLowerCase()
    return ordenAscendente.value ? vA.localeCompare(vB) : vB.localeCompare(vA)
  })

  return filtrados
})

function seleccionar(usuario) {
  // Clonamos y normalizamos el rol para el select (minúsculas)
  user.value = { ...usuario, role: usuario.role.toLowerCase() }
  mostrarTabla.value = false
  mostrarFormulario.value = true
}

// --- EDICIÓN (PUT) ---
async function handleSubmit() {
  const id = user.value.id
  const payload = { ...user.value, role: user.value.role.toUpperCase() }

  try {
    const res = await fetch(`http://localhost:8080/employee/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const errorMsg = await res.text();
      if (res.status === 409) {
        // Captura el conflicto de nombre de usuario desde tu EmployeeService
        notificationStore.addNotification("Conflicto al Editar", errorMsg, "error");
      } else {
        notificationStore.addNotification("Error", "No se pudo actualizar el usuario.", "error");
      }
      return;
    }

    // ✅ Éxito en la edición
    notificationStore.addNotification(
      "Usuario Actualizado", 
      `Los datos de "${payload.username}" se guardaron correctamente.`, 
      "success"
    );

    mostrarFormulario.value = false
    mostrarTabla.value = true
    resetForm()
    
    // Recargar la tabla para ver los cambios
    await cargarUsuarios();

  } catch (err) {
    console.error(err)
    notificationStore.addNotification(
      "Error de Red", 
      "No hay conexión con el servidor para procesar la edición.", 
      "error"
    );
  }
}

function resetForm() {
  user.value = { id: null, firstName: '', lastName: '', nid: '', username: '', password: '', role: '' }
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

* {
  font-family: "Inter", sans-serif;
}

body {
  background-color: #fffaf0;
  margin: 0;
  padding: 2rem;
}

.usuario-manager {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.tabla-formulario {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

/* --- ESTILOS DE LOS NUEVOS CONTROLES DE TABLA --- */
.toolbar-tabla {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  background-color: #f7f7f7;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #9a3412;
}

.select-input-toolbar,
.search-input-toolbar {
  padding: 0.5rem;
  border: 1px solid #fdba74;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
}

.search-input-toolbar {
  flex: 1;
  min-width: 150px;
}

.btn-orden-tabla {
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-weight: bold;
}

/* --- ESTILOS DE LA TABLA --- */
.tabla-contenedor {
  max-width: 1000px;
  width: 100%;
}
.header h2 {
  color: #7c2d12;
  margin-bottom: 1.5rem;
  text-align: center;
}

table {
  background-color: #ffffff;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 0.95rem;
  width: 100%;
}

thead {
  background-color: #fdba74;
  color: #78350f;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #f3f3f3;
}

tbody tr {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

tbody tr:hover {
  background-color: #fff1e0;
}

/* --- ESTILOS DEL FORMULARIO (ORIGINALES) --- */
.user-form {
  background-color: #fff7ed;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-form h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #7c2d12;
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
}

.user-form input,
.user-form select {
  padding: 0.75rem;
  border: 1px solid #fdba74;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #3b2f2f;
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
}

button[type="submit"] {
  background-color: #f97316;
  color: white;
}

button[type="button"] {
  background-color: #fcd34d;
  color: #78350f;
}

@media (max-width: 900px) {
  .toolbar-tabla {
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
