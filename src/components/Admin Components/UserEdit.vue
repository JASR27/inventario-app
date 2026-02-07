<template>
  <div class="usuario-manager">
    <div class="tabla-formulario">
      <!-- Tabla con búsqueda -->
      <div class="tabla-contenedor" v-if="mostrarTabla">
        <div class="table-controls">
          <input
            type="text"
            v-model="busqueda"
            placeholder="Buscar usuario..."
            class="search-input"
          />
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
            <tr
              v-for="usuario in usuariosFiltrados"
              :key="usuario.nid"
              @click="seleccionar(usuario)"
            >
              <td>{{ usuario.firstName }}</td>
              <td>{{ usuario.lastName }}</td>
              <td>{{ usuario.nid }}</td>
              <td>{{ usuario.username }}</td>
              <td>{{ usuario.role }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Formulario editable -->
      <div class="user-form" v-if="mostrarFormulario">
        <h2>Formulario de Usuario</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div class="form-group">
              <label for="firstName">Primer Nombre:</label>
              <input
                type="text"
                id="firstName"
                v-model="user.firstName"
                required
                minlength="4"
                maxlength="20"
                pattern="[A-Za-z ]{4,20}"
                title="Debe tener entre 4 y 20 caracteres. Solo se permiten letras y espacios"
              />
            </div>

            <div class="form-group">
              <label for="lastName">Primer Apellido:</label>
              <input
                type="text"
                id="lastName"
                v-model="user.lastName"
                required
                minlength="6"
                maxlength="20"
                pattern="[A-Za-z ]{4,20}"
                title="Debe tener entre 4 y 20 caracteres. Solo se permiten letras y espacios"
              />
            </div>

            <div class="form-group">
              <label for="nid">NID:</label>
              <input
                type="text"
                id="nid"
                v-model="user.nid"
                required
                minlength="6"
                maxlength="20"
                pattern="[A-Za-z0-9._-]{6,20}"
                title="Debe tener entre 6 y 20 caracteres. Solo se permiten letras, números y .-_"
              />
            </div>

            <div class="form-group">
              <label for="username">Usuario:</label>
              <input
                type="text"
                id="username"
                v-model="user.username"
                required
                minlength="6"
                maxlength="20"
                pattern="[A-Za-z0-9._-]{6,20}"
                title="Debe tener entre 6 y 20 caracteres. Solo se permiten letras, números y .-_"
              />
            </div>

            <div class="form-group">
              <label for="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                v-model="user.password"
                required
                minlength="6"
                maxlength="20"
                pattern="[A-Za-z0-9._\\-#$&*@]{6,20}"
                title="Debe tener entre 6 y 20 caracteres. Se permiten letras, números y .-_ $#&*@"
              />
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

          <!-- Botones del formulario -->
          <div class="button-group">
            <button
              type="button"
              @click="mostrarTabla = true; mostrarFormulario = false"
              class="toggle-button"
            >
              Regresar
            </button>
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

const usuarios = ref([])
const user = ref({
  id: null,
  firstName: '',
  lastName: '',
  nid: '',
  username: '',
  password: '',
  role: ''
})

const busqueda = ref('')
const mostrarTabla = ref(true)
const mostrarFormulario = ref(false)

// 🔄 Cargar usuarios desde el backend al montar el componente
onMounted(() => {
  fetch('http://localhost:8080/employee')
    .then(response => {
      if (!response.ok) throw new Error('Error al obtener usuarios')
      return response.json()
    })
    .then(data => {
      usuarios.value = data
    })
    .catch(error => {
      console.error('Error al cargar usuarios:', error)
      alert('No se pudo cargar la lista de usuarios.')
    })
})

const usuariosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase()
  return usuarios.value.filter(u =>
    u.firstName.toLowerCase().includes(texto) ||
    u.lastName.toLowerCase().includes(texto) ||
    u.username.toLowerCase().includes(texto) ||
    u.nid.includes(texto)
  )
})

function seleccionar(usuario) {
  user.value = {
    ...usuario,
    role: usuario.role.toLowerCase()
  }
  mostrarTabla.value = false
  mostrarFormulario.value = true
}

function handleSubmit() {
  // Regex de validación
  const nameRegex = /^[A-Za-z ]{4,20}$/
  const nidRegex = /^[A-Za-z0-9._-]{4,20}$/
  const usernameRegex = /^[A-Za-z0-9._-]{6,20}$/
  const passwordRegex = /^[A-Za-z0-9._\-#$&*@]{6,20}$/

  if (!nameRegex.test(user.value.firstName)) {
    alert("El nombre debe tener entre 4 y 20 caracteres y solo puede contener letras y espacios.")
    return
  }
  if (!nameRegex.test(user.value.lastName)) {
    alert("El apellido debe tener entre 4 y 20 caracteres y solo puede contener letras y espacios.")
    return
  }
  if (!nidRegex.test(user.value.nid)) {
    alert("El NID debe tener entre 6 y 20 caracteres y solo puede contener letras, números y .-_")
    return
  }
  if (!usernameRegex.test(user.value.username)) {
    alert("El usuario debe tener entre 6 y 20 caracteres y solo puede contener letras, números y .-_")
    return
  }
  if (!passwordRegex.test(user.value.password)) {
    alert("La contraseña debe tener entre 6 y 20 caracteres y puede contener letras, números y .-_ $#&*@")
    return
  }

  const id = user.value.id
  const payload = {
    firstName: user.value.firstName,
    lastName: user.value.lastName,
    nid: user.value.nid,
    username: user.value.username,
    password: user.value.password,
    role: user.value.role.toUpperCase()
  }

  fetch(`http://localhost:8080/employee/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (!response.ok) throw new Error('Error al editar el usuario')
      if (response.status === 204) return null
      return response.json()
    })
    .then(data => {
      if (data) {
        alert(`Usuario "${data.username}" editado con éxito`)
      } else {
        alert(`Usuario editado con éxito`)
      }
      mostrarFormulario.value = false
      mostrarTabla.value = true
      resetForm()
      return fetch('http://localhost:8080/employee')
    })
    .then(response => response.json())
    .then(data => {
      usuarios.value = data
    })
    .catch(error => {
      console.error('Error:', error)
      alert('Hubo un problema al editar el usuario.')
    })
}

function resetForm() {
  user.value = {
    id: null,
    firstName: '',
    lastName: '',
    nid: '',
    username: '',
    password: '',
    role: ''
  }
}
</script>


<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

/* Fuente global */
* {
  font-family: "Inter", sans-serif;
}

body {
  background-color: #fffaf0;
  margin: 0;
  padding: 2rem;
}

/* Contenedor principal */
.usuario-manager {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
}

/* Contenedor de tabla + formulario */
.tabla-formulario {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

/* Botón para mostrar/ocultar tabla */
.table-toggle {
  width: 100%;
  text-align: right;
  margin-bottom: 1rem;
}

.toggle-button {
  background-color: #fcd34d;
  color: #78350f;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-button:hover {
  background-color: #fbbf24;
}

/* Controles de búsqueda */
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #fdba74;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #3b2f2f;
  width: 100%;
  max-width: 300px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #fb923c;
}

/* Tabla */
.tabla-contenedor {
  max-width: 700px;
  width: 100%;
}

table {
  background-color: #fff7ed;
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
  border-bottom: 1px solid #fde68a;
}

tbody tr {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

tbody tr:hover {
  background-color: #fff1e0;
}

/* Formulario */
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

/* Grid para campos en dos columnas */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

/* Inputs y select */
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
  transition: border-color 0.3s ease;
}

.user-form input:focus,
.user-form select:focus {
  outline: none;
  border-color: #fb923c;
}

.user-form select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 8L10 12L14 8' stroke='%239a3412' stroke-width='2'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

/* Botones del formulario */
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

button[type="submit"] {
  background-color: #f97316;
  color: white;
}

button[type="submit"]:hover {
  background-color: #ea580c;
}

button[type="button"] {
  background-color: #fcd34d;
  color: #78350f;
}

button[type="button"]:hover {
  background-color: #fbbf24;
}

/* Responsive */
@media (max-width: 900px) {
  .usuario-manager {
    flex-direction: column;
    align-items: stretch;
  }

  .tabla-formulario {
    flex-direction: column;
  }

  .table-toggle {
    text-align: left;
  }

  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: 100%;
  }

  table,
  .user-form {
    max-width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

