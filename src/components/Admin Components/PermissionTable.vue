<template>
  <div class="permission-container">
    <h2>Solicitudes de Permiso</h2>

    <div class="toolbar-tabla" v-if="permissions.length">
      <div class="control-group">
        <label>Buscar por:</label>
        <select v-model="campoBusqueda" class="select-input-toolbar">
          <option value="todos">Todos los campos</option>
          <option value="requester">Solicitante</option>
          <option value="reason">Razón</option>
          <option value="permissionStatus">Estado</option>
          <option value="fecha">Fecha (DD/MM/AAAA)</option>
        </select>
        <input type="text" v-model="busqueda" :placeholder="placeholderBusqueda" class="search-input-toolbar" />
      </div>

      <div class="control-group">
        <label>Ordenar por:</label>
        <select v-model="criterioOrden" class="select-input-toolbar">
          <option value="startTime">Fecha/Hora</option>
          <option value="requester">Solicitante</option>
          <option value="reason">Razón</option>
          <option value="permissionStatus">Estado</option>
        </select>
        <button @click="ordenAscendente = !ordenAscendente" class="btn-orden-tabla">
          {{ ordenAscendente ? 'Ascendente ▲' : 'Descendente ▼' }}
        </button>
      </div>
    </div>

    <table class="permissions-table" v-if="permissionsFiltradosYOrdenados.length">
      <thead>
        <tr>
          <th>Solicitante</th>
          <th>Razón</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="perm in permissionsFiltradosYOrdenados" :key="perm.id">
          <td>
            {{ perm.requester
              ? perm.requester.firstName + ' ' + perm.requester.lastName
              : 'Pendiente' }}
          </td>
          <td>{{ perm.reason }}</td>
          <td>
            <span :class="['badge', perm.permissionStatus.toLowerCase()]">
              {{ perm.permissionStatus }}
            </span>
          </td>
          <td>{{ formatDateOnly(perm.startTime) }}</td>
          <td>{{ formatTimeOnly(perm.startTime) }}</td>
          <td>{{ formatTimeOnly(getEndTime(perm.startTime, perm.duration)) }}</td>
          <td>
            <div class="action-buttons" v-if="perm.permissionStatus === 'PENDING'">
              <button @click="approvePermission(perm.id)" class="approve">Aprobar</button>
              <button @click="rejectPermission(perm.id)" class="reject">Rechazar</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else-if="permissions.length > 0">No se encontraron resultados para la búsqueda.</p>
    <p v-else>No hay permisos pendientes.</p>
  </div>
</template>

<script>
import { useNotificationStore } from '../../store/useNotificationStore.js';

export default {
  name: "PermissionTable",
  data() {
    return {
      permissions: [],
      busqueda: '',
      campoBusqueda: 'todos',
      criterioOrden: 'startTime',
      ordenAscendente: false,
    };
  },
  computed: {
    placeholderBusqueda() {
      const ops = {
        todos: 'Buscar...',
        requester: 'Nombre...',
        reason: 'Razón...',
        permissionStatus: 'Estado...',
        fecha: 'Ej: 14/02/2026...'
      };
      return ops[this.campoBusqueda];
    },
    permissionsFiltradosYOrdenados() {
      let filtrados = this.permissions.filter(p => {
        const texto = this.busqueda.toLowerCase().trim();
        if (!texto) return true;

        const nombreCompleto = p.requester ? `${p.requester.firstName} ${p.requester.lastName}`.toLowerCase() : '';
        const mREQ = nombreCompleto.includes(texto);
        const mRES = (p.reason || '').toLowerCase().includes(texto);
        const mSTA = (p.permissionStatus || '').toLowerCase().includes(texto);
        const fechaFormateada = this.formatDateOnly(p.startTime);
        const mFEC = fechaFormateada.includes(texto);

        if (this.campoBusqueda === 'requester') return mREQ;
        if (this.campoBusqueda === 'reason') return mRES;
        if (this.campoBusqueda === 'permissionStatus') return mSTA;
        if (this.campoBusqueda === 'fecha') return mFEC;

        return mREQ || mRES || mSTA || mFEC;
      });

      filtrados.sort((a, b) => {
        let vA, vB;
        if (this.criterioOrden === 'requester') {
          vA = a.requester ? (a.requester.firstName + a.requester.lastName).toLowerCase() : '';
          vB = b.requester ? (b.requester.firstName + b.requester.lastName).toLowerCase() : '';
        } else {
          vA = (a[this.criterioOrden] || '').toString().toLowerCase();
          vB = (b[this.criterioOrden] || '').toString().toLowerCase();
        }

        if (this.criterioOrden === 'startTime') {
          return this.ordenAscendente ? a.startTime - b.startTime : b.startTime - a.startTime;
        }
        return this.ordenAscendente ? vA.localeCompare(vB) : vB.localeCompare(vA);
      });

      return filtrados;
    }
  },
  mounted() {
    this.fetchPermissions();
  },
  methods: {
    formatDateOnly(epochSeconds) {
      const d = new Date(Number(epochSeconds) * 1000); // Multiplicamos por 1000 para volver a milisegundos para Date()
      return d.toLocaleDateString([], { year: "numeric", month: "2-digit", day: "2-digit" });
    },
    formatTimeOnly(epochSeconds) {
      const d = new Date(Number(epochSeconds) * 1000);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    },
    getEndTime(startSeconds, durationMinutes) {
      // Cálculo basado en segundos
      return Number(startSeconds) + (durationMinutes * 60);
    },
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
      return null;
    },
    async fetchPermissions() {
      const notificationStore = useNotificationStore();
      try {
        const res = await fetch("http://localhost:8080/absence");
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        const data = await res.json();

        this.permissions = data.map((p) => ({
          ...p,
          // Guardamos en segundos para facilitar el ordenamiento numérico
          startTime: Math.floor(Number(p.startTime) / 1000),
        }));
      } catch (e) {
        console.error("Error cargando permisos:", e);
        notificationStore.addNotification(
          "Error de Carga", 
          "No se pudieron obtener las solicitudes de permiso.", 
          "error"
        );
      }
    },
    async updatePermissionStatus(id, status) {
      const notificationStore = useNotificationStore();
      const supervisorId = this.getCookie("userid");

      if (!supervisorId) {
        notificationStore.addNotification(
          "Sesión Inválida", 
          "No se detectó el ID del supervisor. Por favor, reingrese al sistema.", 
          "warning"
        );
        return;
      }

      const body = { permissionStatus: status, supervisorId: parseInt(supervisorId) };
      
      try {
        const res = await fetch(`http://localhost:8080/absence/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

        // ✅ Notificación de éxito
        const accion = status === "APPROVED" ? "aprobado" : "rechazado";
        notificationStore.addNotification(
          "Estado Actualizado", 
          `El permiso ha sido ${accion} con éxito.`, 
          "success"
        );

        this.fetchPermissions();
      } catch (e) {
        console.error(`Error al actualizar permiso (${status}):`, e);
        notificationStore.addNotification(
          "Fallo de Acción", 
          "Hubo un problema al comunicar la decisión al servidor.", 
          "error"
        );
      }
    },
    approvePermission(id) { this.updatePermissionStatus(id, "APPROVED"); },
    rejectPermission(id) { this.updatePermissionStatus(id, "REJECTED"); },
  },
};
</script>
<style scoped>
/* Agrega estos estilos a tu bloque <> existente */

.toolbar-tabla {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  background-color: #f7f7f7;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 1100px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #9a3412;
}

.select-input-toolbar,
.search-input-toolbar {
  padding: 0.5rem;
  border: 1px solid #fdba74;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
}

.search-input-toolbar {
  flex: 1;
  min-width: 200px;
}

.btn-orden-tabla {
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-weight: bold;
}

/* ... Mantén tus otros estilos igual ... */

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

/* Contenedor principal de la tabla */
.permission-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

/* Tabla de permisos */
.permissions-table {
  background-color: #ffffff;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 0.95rem;
  width: 100%;
  max-width: 1100px;
}

.permissions-table thead {
  background-color: #fdba74;
  color: #78350f;
}

h2 {
  color: #78350f;

}

.permissions-table th,
.permissions-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
}

.permissions-table tbody tr {
  transition: background-color 0.3s ease;
}

.permissions-table tbody tr:hover {
  background-color: #fff1e0;
}

/* Badge de estado */
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.badge.approved {
  background-color: #d1fae5;
  color: #065f46;
}

.badge.rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Botones de acción */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons button {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}



.action-buttons button {
  background-color: #fcd34d;
  color: #78350f;
}

.action-buttons button:hover {
  background-color: #fbbf24;
}

.action-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 900px) {
  .permissions-table {
    font-size: 0.9rem;
    max-width: 100%;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons button {
    width: 100%;
  }
}
</style>
