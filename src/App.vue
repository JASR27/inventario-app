<template>
<NotificationToast />
  <div v-if="mostrarSidebar" class="layout">
    <component :is="sidebarActual" />
    <main class="contenido-principal">
      <router-view />
    </main>
  </div>

  <div v-else>
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NotificationToast from './components/Generic Components/NotificationToast.vue'

const route = useRoute()

const mostrarSidebar = computed(() =>
  route.path.startsWith('/dashboard/empleado') ||
  route.path.startsWith('/dashboard/admin')
)

const sidebarActual = computed(() => {
  if (route.path.startsWith('/dashboard/admin')) return 'SidebarAdmin'
  if (route.path.startsWith('/dashboard/empleado')) return 'SidebarEmpleado'
  return null
})
</script>

<style>
.layout {
  display: flex;
}

.contenido-principal {
  margin-left: 260px;
  padding: 2rem;
  width: calc(100% - 260px);
  box-sizing: border-box;
}

body {
  font-family: "Inter", sans-serif;/* Gris claro degradado */
  min-height: 100vh;
}
</style>
 

