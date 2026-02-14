<template>
    <div class="dashboard-graficos">
        <Sidebar />

        <absensereport />

        
    </div>
</template>

<script setup>
import absensereport from '../../components/Admin Components/AbsenseReport.vue'
import Sidebar from '../../components/Generic Components/SidebarAdmin.vue';
</script>

<style scoped>
.dashboard-graficos {
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
