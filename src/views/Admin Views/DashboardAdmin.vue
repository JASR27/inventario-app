<template>
  <Sidebar />

  <div class="barra-rol">
    Usted ha ingresado al sistema con el rol de <strong>administrador</strong>
  </div>

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
import Sidebar from '../../components/Generic Components/SidebarAdmin.vue'

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
.barra-rol {
  margin-left: 260px;
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100% - 260px);
  background-color: #fef3c7;
  border-bottom: 1px solid #fcd34d;
  padding: 12px 24px;
  font-size: 16px;
  color: #78350f;
  font-family: 'Inter', sans-serif;
  text-align: center;
  z-index: 1000;
}

.bienvenida-marco {
  margin: 38px auto 32px auto; /* espacio para la barra fija */
  max-width: 600px;
  background-color: #fff7ed;
  border: 1px solid #fdba74;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  font-family: 'Inter', sans-serif;
  color: #78350f;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
}

h1 {
  font-size: 32px;
  margin-bottom: 24px;
  color: #9a3412;
}

.imagen {
  width: 280px;
  height: auto;
  margin: 0px auto 24px auto;
  display: block;
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

.tasa {
  background-color: #fed7aa;
  border: 1px solid #fdba74;
  padding: 16px;
  border-radius: 8px;
  font-size: 19px;
  color: #7c2d12;
  margin-top: 16px;
}
</style>




