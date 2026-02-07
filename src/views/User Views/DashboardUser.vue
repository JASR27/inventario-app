<template>
  <Sidebar />
  <div class="bienvenida-marco">
    <h1>Bienvenido al sistema</h1>

    <img src="../../assets/image.png" alt="Imagen de bienvenida" class="imagen" />

    <div class="tasa">
      <h2>Tasa oficial BCV del día</h2>
      <p v-if="tasa">1 USD = {{ tasa }} VES</p>
      <p v-else>Cargando tasa...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarUser.vue'

const tasa = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares')
    const data = await res.json()
    const bcv = data.find(item => item.fuente === 'oficial')
    tasa.value = bcv?.promedio?.toFixed(2)
  } catch (error) {
    console.error('Error al obtener la tasa BCV:', error)
  }
})
</script>

<style scoped>
.bienvenida-marco {
  margin: 2rem auto;
  max-width: 600px;
  background-color: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}


h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #065f46;
}

.imagen {
  max-width: 280px;
  width: 100%;
  margin: 0 auto 1.5rem auto;
  display: block;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tasa {
  background-color: #d1fae5;
  border: 1px solid #a7f3d0;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.2rem;
  color: #065f46;
  margin-top: 1rem;
}

.fuente {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #065f46;
}

.fuente a {
  color: #10b981;
  text-decoration: none;
}
</style>




