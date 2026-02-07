<template>
  <aside class="sidebar-empleado">
    <ul>
      <li @click="toggle('Gestionar Inventario')">
        Gestionar Inventario
        <ul v-if="activo === 'Gestionar Inventario'" class="submenu">
          <li><router-link to="/dashboard/empleado/registerProduct">Registrar producto</router-link></li>
          <li><router-link to="/dashboard/empleado/registerReposition">Registrar reposición</router-link></li>
          <li><router-link to="/dashboard/empleado/registerProvider">Registrar proveedor</router-link></li>
          <li><router-link to="/dashboard/empleado/inventory">Visualizar inventario</router-link></li>
        </ul>
      </li>

      <li @click="toggle('Gestionar Transacciones')">
        Gestionar Transacciones
        <ul v-if="activo === 'Gestionar Transacciones'" class="submenu">
          <li><router-link to="/dashboard/empleado/registerClient">Registrar cliente</router-link></li>
          <li><router-link to="/dashboard/empleado/Sale">Gestionar venta</router-link></li>
          <li><router-link to="/dashboard/empleado/Refund">Gestionar devolución</router-link></li>
        </ul>
      </li>

      <li @click="toggle('Mi Actividad')">
        Mi Actividad
        <ul v-if="activo === 'Mi Actividad'" class="submenu">
          <li><router-link to="/dashboard/empleado/registerPermission">Solicitar permiso</router-link></li>
          
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
  if (ruta.includes('/dashboard/empleado/registerProduct') ||
      ruta.includes('/dashboard/empleado/registerReposition') ||
      ruta.includes('/dashboard/empleado/registerProvider') ||
      ruta.includes('/dashboard/empleado/inventory')) {
    activo.value = 'Gestionar Inventario'
  } else if (ruta.includes('/dashboard/empleado/Sale') ||
             ruta.includes('/dashboard/empleado/Refund') ||
             ruta.includes('/dashboard/empleado/registerClient')) {
    activo.value = 'Gestionar Transacciones'
  } else if (ruta.includes('/dashboard/empleado/registerPermission') ||
             ruta.includes('/dashboard/empleado/registerAssistance')) {
    activo.value = 'Mi Actividad'
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

.sidebar-empleado {
  position: fixed;
  /* ← Esto la fija en pantalla */
  top: 0;
  /* Desde el borde superior */
  left: 0;
  /* Desde el borde izquierdo */
  width: 260px;
  height: 100vh;
  /* Ocupa toda la altura de la ventana */
  background-color: #adfbc5;
  padding: 1.5rem;
  color: #065f46;
  font-family: "Inter", sans-serif;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-sizing: border-box;
  overflow-y: auto;
  /* ← Permite scroll interno si el menú crece */
  z-index: 1000;
  /* ← Asegura que esté por encima del contenido */
}


ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  /* ✅ Asegura que los hijos respeten el ancho */
}

li {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background-color: #d1fae5;
  color: #065f46;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-weight: 500;
  box-sizing: border-box;
  /* ✅ Incluye padding en el ancho total */
  width: 100%;
}

li:hover {
  background-color: #7edaaf;
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
  background-color: #ecfdf5;
  color: #166534;
  font-size: 0.95rem;
  transition: background-color 0.3s ease;
  box-sizing: border-box;
  /* ✅ Evita que el padding expanda el ancho */
}

.submenu li a:hover {
  background-color: #d1fae5;
}

.router-link-active {
  font-weight: bold;
  color: #10b981;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>
