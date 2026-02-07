<template>
  <div class="modal-panel">
    <h2>Pagos registrados</h2>

    <table class="tabla-pagos">
      <thead>
        <tr>
          <th>ID Pago</th>
          <th>ID Pagador</th>
          <th>Método</th>
          <th>Monto</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(pago, index) in pagos" :key="pago.idPago">
          <td>{{ pago.idPago }}</td>
          <td>{{ pago.idPagador }}</td>
          <td>{{ pago.metodo }}</td>
          <td>{{ formato(pago.monto) }}</td>
          <td>
            <button class="eliminar" @click="$emit('eliminar', index)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="button-group">
      <button type="button" @click="$emit('cerrar')">Cerrar</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  pagos: Array
})

function formato(valor) {
  return 'Bs ' + valor.toFixed(2)
}
</script>

<style scoped>
.modal-panel {
  background-color: #f0fdf4;
  padding: 2rem;
  border-radius: 12px;
  max-width: 700px;
  margin: auto;
  margin-top: 2vh;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Inter", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  color: #166534;
  text-align: center;
}

.tabla-pagos {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  font-size: 0.95rem;
}

thead {
  background-color: #d1fae5;
  color: #065f46;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
}

th:last-child,
td:last-child {
  border-right: none;
}

tr:hover {
  background-color: #ecfdf5;
}

button {
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-family: "Inter", sans-serif;
    transition: background-color 0.3s ease;
    min-width: 140px;
    /* ← ancho uniforme */
    text-align: center;
}

.button-group {
  display: flex;
  justify-content: flex-end;
}

.eliminar {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.eliminar:hover {
  background-color: #059669;
}
</style>
