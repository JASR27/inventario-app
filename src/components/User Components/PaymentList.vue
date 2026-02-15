<template>
  <div class="modal-panel">
    <h2>Pagos registrados</h2>

    <div class="table-container">
      <table class="tabla-pagos">
        <thead>
          <tr>
            <th>Método</th>
            <th class="text-right">Monto</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(pago, index) in pagos" :key="index">
            <td class="col-metodo">
              <span :class="['badge', pago.method.toLowerCase()]">{{ pago.method }}</span>
            </td>
            <td class="col-monto text-right">{{ formato(pago.amount) }}</td>
            <td class="text-center">
              <button class="btn-eliminar" @click="confirmarEliminacion(index, pago)">
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="pagos.length === 0">
            <td colspan="3" class="no-data">No hay pagos registrados aún.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer-actions">
      <button type="button" class="btn-cerrar" @click="$emit('cerrar')">
        Cerrar
      </button>
    </div>
  </div>
</template>

<script setup>
import { useNotificationStore } from '../../store/useNotificationStore.js';

const notificationStore = useNotificationStore();
const props = defineProps({
  pagos: Array
})

const emit = defineEmits(['eliminar', 'cerrar'])

function formato(valor) {
  return (parseFloat(valor) || 0).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' Bs.';
}

function confirmarEliminacion(index, pago) {
  emit('eliminar', index);
  notificationStore.addNotification(
    "Pago eliminado", 
    `Se ha removido el pago de ${formato(pago.amount)} (${pago.method}).`, 
    "info"
  );
}
</script>

<style scoped>
.modal-panel {
  background-color: #f0fdf4;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  margin: 2vh auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  font-family: "Inter", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h2 { color: #166534; text-align: center; margin: 0; font-size: 1.6rem; }

.table-container {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

table { width: 100%; border-collapse: collapse; }
th { background-color: #d1fae5; color: #065f46; font-weight: 700; padding: 1rem; text-align: left; }
td { padding: 0.8rem 1rem; border-bottom: 1px solid #f1f5f9; }

.text-right { text-align: right; }
.text-center { text-align: center; }

.col-monto { font-family: 'Courier New', monospace; font-weight: bold; color: #111827; }

.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}
.badge.cash { background: #dcfce7; color: #15803d; }
.badge.pos { background: #dbeafe; color: #1d4ed8; }

.btn-eliminar {
  background-color: #fee2e2;
  color: #b91c1c;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
}

.btn-eliminar:hover { background-color: #fecaca; }

.no-data { text-align: center; padding: 2rem; color: #94a3b8; font-style: italic; }

/* Cambios aplicados para igualar tus otros paneles */
.footer-actions {
  display: flex;
  justify-content: flex-end; /* Alineado a la izquierda */
}

.btn-cerrar {
  padding: 0.7rem 2rem;
  background-color: #f3f4f6;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-cerrar:hover {
  background-color: #e5e7eb;
}
</style>
