<template>
  <div class="permission-register-view">
    <Sidebar />

    <main class="content">
      <PermissionForm />
    </main>
  </div>
</template>

<script>
import PermissionForm from '../../components/User Components/PermissionForm.vue';
import Sidebar from '../../components/Generic Components/SidebarUser.vue';

export default {
  components: {
    Sidebar,
    PermissionForm
  }
}

</script>

<style scoped>
.permission-register-view {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
}

.content {
  flex: 1;
  padding: 2rem;
  background-color: #f9f9f9;
}
</style>