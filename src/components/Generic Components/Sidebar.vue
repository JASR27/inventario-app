<template>
  <aside class="sidebar">
    <ul>
      <!-- Menú para administrador -->
      <template v-if="rol === 'admin'">
        <li @click="toggle('Gestionar Usuarios')">
          Gestionar Usuarios
          <ul v-if="activo === 'Gestionar Usuarios'" class="submenu">
            <li><router-link to="/dashboard/admin/createUser">Agregar usuario</router-link></li>
            <li><router-link to="/dashboard/admin/editUser">Modificar usuario</router-link></li>
            <li><router-link to="/dashboard/admin/deleteUser">Eliminar usuario</router-link></li>
          </ul>
        </li>
        <li @click="toggle('Gestionar RRHH')">
          Gestionar RRHH
          <ul v-if="activo === 'Gestionar RRHH'" class="submenu">
            <li><router-link to="/dashboard/admin/permissions">Gestionar permisos</router-link></li>
          </ul>
        </li>
        <li @click="toggle('Visualizar Reportes')">
          Visualizar Reportes
          <ul v-if="activo === 'Visualizar Reportes'" class="submenu">
            <li><router-link to="/dashboard/admin/charts">Reportes de ventas</router-link></li>
            <li><router-link to="/dashboard/empleado/stock">Reportes de inventario</router-link></li>
            <li><router-link to="/dashboard/empleado/stock">Reportes de personal</router-link></li>
          </ul>
        </li>
        <li @click="toggle('Gestionar Registros')">
          Gestionar Registros
          <ul v-if="activo === 'Gestionar Registros'" class="submenu">
            <li><router-link to="/dashboard/empleado/productos">Gestionar inventario</router-link></li>
            <li><router-link to="/dashboard/empleado/stock">Gestionar transacciones</router-link></li>
          </ul>
        </li>
      </template>

      <!-- Menú para empleado -->
      <template v-else-if="rol === 'empleado'">
        <li @click="toggle('Gestionar Inventario')">
          Gestionar Inventario
          <ul v-if="activo === 'Gestionar Inventario'" class="submenu">
            <li><router-link to="/dashboard/empleado/registerProduct">Registrar producto</router-link></li>
            <li><router-link to="/dashboard/empleado/registerReposition">Registrar reposición</router-link></li>
            <li><router-link to="/dashboard/empleado/registerProvider">Registrar proveedor</router-link></li>
          </ul>
        </li>
        <li @click="toggle('Gestionar Transacciones')">
          Gestionar Transacciones
          <ul v-if="activo === 'Gestionar Transacciones'" class="submenu">
            <li><router-link to="/dashboard/empleado/Sale">Gestionar venta</router-link></li>
            <li><router-link to="/dashboard/empleado/stock">Gestionar devolución</router-link></li>
          </ul>
        </li>
        <li @click="toggle('Mi Actividad')">
          Mi Actividad
          <ul v-if="activo === 'Mi Actividad'" class="submenu">
            <li><router-link to="/dashboard/empleado/registerPermission">Solicitar permiso</router-link></li>
            <li><router-link to="/dashboard/empleado/registerAssistance">Registrar asistencia</router-link></li>
          </ul>
        </li>
      </template>
      
      <li @click="cerrarSesion">Cerrar sesión</li>
    </ul>
  </aside>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activo = ref(null)
const rol = localStorage.getItem('rol') // 👈 aquí obtenemos el rol

function toggle(seccion) {
  activo.value = activo.value === seccion ? null : seccion
}

function cerrarSesion() {
  localStorage.removeItem('autenticado')
  localStorage.removeItem('rol')
  router.push('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

.sidebar {
  width: 260px;
  background: linear-gradient(135deg, #14532d, #166534); /* Verde oscuro degradado */
  padding: 1.5rem;
  height: 100vh;
  color: #e6f4ea;
  font-family: 'Inter', sans-serif;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-size: 1rem;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 1rem;
  color: #d1fae5;
}

li:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.submenu {
  margin-left: 0;
  margin-top: 0.5rem;
  padding-left: 0;
  border-left: none; /* Verde lima */
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.submenu li {
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #bbf7d0;
}

.submenu li:hover {
  background-color: rgba(255, 255, 255, 0.18);
}

.router-link-active {
  font-weight: bold;
  color: #4ade80; /* Verde brillante */
}

/* Estilo para router-link */
a {
  text-decoration: none;
  color: inherit;
}

/* Opcional: mejora visual al pasar el mouse */
a:hover {
  color: #a7f3d0; /* tono verde claro */
  text-decoration: none;
}

</style>


