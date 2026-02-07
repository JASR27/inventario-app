<template>
    <div class="table-container">
    <table>
        <thead>
            <tr>
                <th>Solicitante</th>
                <th>Revisor</th>
                <th>Razón</th>
                <th>Estado</th>
                <th>Inicio</th>
                <th>Finalización</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="permiso in permisos" :key="permiso.id" :class="{
                aprobado: permiso.status === 'Aprobado',
                rechazado: permiso.status === 'Rechazado'
            }">
                <td>{{ permiso.solicitante }}</td>
                <td>{{ permiso.revisor || '—' }}</td>
                <td>{{ permiso.razon }}</td>
                <td>{{ permiso.status }}</td>
                <td>{{ permiso.inicio }}</td>
                <td>{{ permiso.fin }}</td>
                <td>
                    <div class="buttons">
                        <button class="approve-button" @click="aprobar(permiso)"
                            :disabled="permiso.status !== 'Pendiente'">
                            Aprovado
                        </button>
                        <button class="reject-button" @click="rechazar(permiso)"
                            :disabled="permiso.status !== 'Pendiente'">
                            Rechazado
                        </button>
                    </div>
                </td>

            </tr>
        </tbody>
    </table>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const permisos = ref([
    {
        id: 1,
        solicitante: 'anap',
        revisor: '',
        razon: 'Consulta médica',
        status: 'Pendiente',
        inicio: '2025-09-21 09:00',
        fin: '2025-09-21 12:00'
    },
    {
        id: 2,
        solicitante: 'luisg',
        revisor: '',
        razon: 'Trámite personal',
        status: 'Pendiente',
        inicio: '2025-09-22 14:00',
        fin: '2025-09-22 16:00'
    }
])

function aprobar(permiso) {
    const confirmado = window.confirm(`¿Deseas aprobar la solicitud de ${permiso.solicitante}?`)
    if (confirmado) {
        permiso.status = 'Aprobado'
        permiso.revisor = 'admin' // puedes reemplazar con el usuario actual
    }
}

function rechazar(permiso) {
    const confirmado = window.confirm(`¿Deseas rechazar la solicitud de ${permiso.solicitante}?`)
    if (confirmado) {
        permiso.status = 'Rechazado'
        permiso.revisor = 'admin'
    }
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

/* Fuente global */
* {
    font-family: "Inter", sans-serif;
}

body {
    background-color: #fffaf0;
    margin: 0;
    padding: 2rem;
}

.table-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background-color: #fff7ed;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}


table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
    border-radius: 12px;
    overflow: hidden;
}

thead {
    background-color: #fdba74;
    color: #78350f;
}

th,
td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #fde68a;
}

tbody tr {
    transition: background-color 0.3s ease;
}

tbody tr:hover {
    background-color: #fff1e0;
}

/* Estados visuales */
.aprobado {
    background-color: #dcfce7;
}

.rechazado {
    background-color: #fee2e2;
}

.buttons{
    display: flex;
    flex-direction: row;
    gap: 10px;
}
/* Botones de acción */
.approve-button {
  background-color: #f97316;
       /* Verde suave */
  color: white;                    /* Texto blanco */
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  transition: background-color 0.3s ease;
}

.approve-button:hover {
  background-color: #ea580c;      /* Verde más intenso al pasar el mouse */
}

.reject-button {
  background-color: #e5e7eb;
    color: #374151;                 /* Texto blanco */
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  transition: background-color 0.3s ease;
}

.reject-button:hover {
  background-color: #d1d5db;;     /* Rojo más intenso al pasar el mouse */
}


/* Botones deshabilitados */
button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
