<template>
  <div class="usuario-manager">
    <div class="tabla-contenedor">
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="usuario in usuariosFiltrados"
            :key="usuario.nid"
            :class="{ seleccionado: usuarioSeleccionado?.nid === usuario.nid }"
            @click="seleccionar(usuario)"
          >
            <td>{{ usuario.firstName }}</td>
            <td>{{ usuario.lastName }}</td>
            <td>{{ usuario.nid }}</td>
            <td>{{ usuario.username }}</td>
            <td>{{ usuario.role }}</td>
            <td>
              <button
                class="delete-button"
                @click.stop="terminarUsuario(usuario)"
                :disabled="usuario.role === 'TERMINATED'"
              >
                Terminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const usuarios = ref([])
const busqueda = ref('')
const usuarioSeleccionado = ref(null)

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
  usuarioSeleccionado.value = usuario
}

function terminarUsuario(usuario) {
  const confirmado = window.confirm(`¿Deseas marcar al usuario "${usuario.username}" como TERMINATED?`)
  if (!confirmado) return

  const id = usuario.id || usuario.nid

  fetch(`http://localhost:8080/employee/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: 'TERMINATED' })
  })
    .then(response => {
      if (!response.ok) throw new Error('Error al editar el usuario')
      if (response.status === 204) return null
      return response.json()
    })
    .then(() => {
      alert(`Usuario "${usuario.username}" marcado como TERMINATED.`)
      usuario.role = 'TERMINATED'
    })
    .catch(error => {
      console.error('Error:', error)
      alert('Hubo un problema al actualizar el estado del usuario.')
    })
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

/* Fila seleccionada */
.seleccionado {
  background-color: #ffe8cc !important;
}

/* Botón de eliminar */
.delete-button {
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  transition: background-color 0.3s ease;
}

.delete-button:hover {
  background-color: #ea580c;
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
