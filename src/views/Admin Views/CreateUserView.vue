<template>
  <div class="create-user-view">
    <Sidebar />

    <main class="content">
      
      <UserForm />
    </main>
  </div>
</template>

<script>
import Sidebar from '../../components/Generic Components/SidebarAdmin.vue';
import UserForm from '../../components/Admin Components/UserForm.vue';

export default {
  name: 'CreateUserView',
  components: {
    Sidebar,
    UserForm
  }
};
</script>

<style scoped>
.create-user-view {
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
