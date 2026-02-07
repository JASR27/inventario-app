<template>
  <div class="layout">
    <Sidebar />
    <div class="content">
      <div class="form-wrapper">
        <UserDelete />
      </div>
    </div>
  </div>
</template>


<script setup>
import Sidebar from '../../components/Generic Components/SidebarAdmin.vue'
import UserDelete from '../../components/Admin Components/UserDelete.vue'

</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar fijo a la izquierda */
.sidebar {
  width: 250px;
  background-color: #fff7ed;
  border-right: 1px solid #fdba74;
}

/* Área de contenido */
.content {
  flex: 1;
  display: flex;
  justify-content: center; /* Centra horizontalmente */
  padding: 2rem;
  background-color: #f9f9f9;
}

/* Contenedor del formulario */
.form-wrapper {
  width: 100%;
  max-width: 700px;
}
</style>