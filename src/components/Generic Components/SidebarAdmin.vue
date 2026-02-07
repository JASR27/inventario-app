<template>
  <aside class="sidebar-admin">
    <ul>
      <li @click="toggle('Gestionar Usuarios')">
        Gestionar Usuarios
        <ul v-if="activo === 'Gestionar Usuarios'" class="submenu">
          <li><router-link to="/dashboard/admin/createUser">Agregar usuario</router-link></li>
          <li><router-link to="/dashboard/admin/editUser">Modificar usuario</router-link></li>
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
          <li><router-link to="/dashboard/admin/inventory">Gestionar inventario</router-link></li>
          <li><router-link to="/dashboard/admin/transactions">Gestionar transacciones</router-link></li>
          <li><router-link to="/dashboard/admin/adjustment">Registrar ajuste de inventario</router-link></li>
        </ul>
      </li>

      <li @click="cerrarSesion">Cerrar sesión</li>
    </ul>
  </aside>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activo = ref(null)

function detectarSeccion(ruta) {
  if (ruta.includes('/dashboard/admin/createUser') ||
      ruta.includes('/dashboard/admin/editUser') ||
      ruta.includes('/dashboard/admin/deleteUser')) {
    activo.value = 'Gestionar Usuarios'
  } else if (ruta.includes('/dashboard/admin/permissions')) {
    activo.value = 'Gestionar RRHH'
  } else if (ruta.includes('/dashboard/admin/charts') ||
             ruta.includes('/dashboard/empleado/stock')) {
    activo.value = 'Visualizar Reportes'
  } else if (ruta.includes('/dashboard/empleado/productos') ||
             ruta.includes('/dashboard/empleado/stock')) {
    activo.value = 'Gestionar Registros'
  } else {
    activo.value = null
  }
}

onMounted(() => {
  detectarSeccion(route.path)
})

watch(() => route.path, (nuevaRuta) => {
  detectarSeccion(nuevaRuta)
})

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
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.sidebar-admin {
  position: fixed;         /* ← Fija la sidebar en pantalla */
  top: 0;                  /* Desde el borde superior */
  left: 0;                 /* Desde el borde izquierdo */
  width: 260px;
  height: 100vh;
  background-color: #ffce92;
  padding: 1.5rem;
  color: #78350f;
  font-family: "Inter", sans-serif;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-sizing: border-box;
  overflow-y: auto;        /* ← Scroll interno si el contenido crece */
  overflow-x: hidden;
  z-index: 1000;           /* ← Asegura que esté por encima del contenido */
}


ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

li {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background-color: #f9e594;
  color: #78350f;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-weight: 500;
  box-sizing: border-box;
  width: 100%;
}

li:hover {
  background-color: #ffcb20;
  transform: translateX(4px);
}

.submenu {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.submenu li {
  padding: 0;
  width: 100%;
}

.submenu li a {
  padding: 0.5rem 1rem;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background-color: #fef3c7;
  color: #9a3412;
  font-size: 0.95rem;
  transition: background-color 0.3s ease;
  box-sizing: border-box;
}

.submenu li a:hover {
  background-color: #fde68a;
}

.router-link-active {
  font-weight: bold;
  color: #f97316;
}

a {
  text-decoration: none;
  color: inherit;
}

</style>



