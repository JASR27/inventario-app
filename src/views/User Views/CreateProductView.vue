<template>
  <div class="create-product-view">
    <Sidebar />

    <main class="content">
      <ProductForm />
    </main>
  </div>
</template>

<script>
import ProductForm from '../../components/User Components/ProductForm.vue';
import Sidebar from '../../components/Generic Components/SidebarUser.vue';

export default {
  components: {
    Sidebar,
    ProductForm
  }
}

</script>

<style scoped>
.create-product-view {
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