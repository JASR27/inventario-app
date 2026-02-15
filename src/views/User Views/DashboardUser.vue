<template>
  <Sidebar />
  <div class="bienvenida-marco">
    <h1>Bienvenido al sistema</h1>

    <div class="imagen-contenedor">
      <img src="../../assets/image.png" alt="Imagen de bienvenida" class="imagen" />
    </div>

    <div class="tasa">
      <h2 class="tasa-titulo">Tasa oficial BCV del día</h2>
      
      <div v-if="tasa" class="tasa-display">
        <span class="moneda-label">1 USD =</span>
        <span class="moneda-valor">{{ tasa }} VES</span>
      </div>
      
      <div v-else class="tasa-cargando">
        <div class="spinner-simple"></div>
        <p>Sincronizando con el servidor...</p>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '../../components/Generic Components/SidebarUser.vue'
import { useNotificationStore } from '../../store/useNotificationStore.js'

const notificationStore = useNotificationStore()
const tasa = ref(null)

onMounted(async () => {
  try {
    // Consumimos el servicio interno para mantener paridad con el Admin
    const res = await fetch('http://localhost:8080/currency/exchange_rate')
    
    if (!res.ok) throw new Error("No se pudo obtener la tasa")
    
    const data = await res.json()
    
    // Validamos si la data es el objeto { price: ... } o el valor directo
    const valor = typeof data === 'object' ? data.price : data
    
    if (valor) {
      tasa.value = parseFloat(valor).toFixed(2)
    }
  } catch (error) {
    notificationStore.addNotification(
      "Error de Sincronización", 
      "No se pudo cargar la tasa cambiaria desde el servidor local.", 
      "error"
    )
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




