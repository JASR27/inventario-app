<template>
  <div class="create-provider-view">
    <Sidebar />

    <main class="content">
      <ProviderForm />
    </main>
  </div>
</template>

<script>
import ProviderForm from '../../components/User Components/ProviderForm.vue';
import Sidebar from '../../components/Generic Components/SidebarUser.vue';

export default {
  components: {
    Sidebar,
    ProviderForm
  }
}

</script>

<style scoped>
.create-provider-view {
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