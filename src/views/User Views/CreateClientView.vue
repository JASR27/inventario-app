<template>
  <div class="create-client-view">
    <Sidebar />

    <main class="content">
      <ClientForm />
    </main>
  </div>
</template>

<script>
import ClientForm from '../../components/User Components/ClientForm.vue';
import Sidebar from '../../components/Generic Components/SidebarUser.vue';

export default {
  components: {
    Sidebar,
    ClientForm
  }
}

</script>

<style scoped>
.create-client-view {
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