<template>
  <div class="permission-container">
    <h2>Solicitudes de Permiso</h2>

    <table class="permissions-table" v-if="permissions.length">
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
        <tr v-for="perm in permissions" :key="perm.id">
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

    <p v-else>No hay permisos pendientes.</p>
  </div>
</template>

<script>
export default {
  name: "PermissionTable",
  data() {
    return {
      permissions: [],
    };
  },
  mounted() {
    this.fetchPermissions();
  },
  methods: {
    formatDateOnly(epochMillis) {
      const d = new Date(Number(epochMillis));
      return d.toLocaleDateString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
    formatTimeOnly(epochMillis) {
      const d = new Date(Number(epochMillis));
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },
    getEndTime(startMillis, durationMinutes) {
      return Number(startMillis) + durationMinutes * 60000;
    },
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
      return null;
    },
    async fetchPermissions() {
      try {
        const res = await fetch("http://localhost:8080/absence");
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        const data = await res.json();
        this.permissions = data
          .map((p) => ({
            ...p,
            startTime: Number(p.startTime) / 1000,
          }))
          .sort((a, b) => b.startTime - a.startTime);
      } catch (e) {
        console.error("Error cargando permisos:", e);
      }
    },
    async updatePermissionStatus(id, status) {
      const supervisorId = this.getCookie("userid");
      if (!supervisorId) {
        alert("No se encontró el ID del supervisor en las cookies.");
        return;
      }

      const body = {
        permissionStatus: status,
        supervisorId: parseInt(supervisorId),
      };

      try {
        const res = await fetch(`http://localhost:8080/absence/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        alert(`Permiso ${status === "APPROVED" ? "aprobado" : "rechazado"}.`);
        this.fetchPermissions();
      } catch (e) {
        console.error(`Error al actualizar permiso (${status}):`, e);
        alert("No se pudo actualizar el estado del permiso.");
      }
    },
    approvePermission(id) {
      this.updatePermissionStatus(id, "APPROVED");
    },
    rejectPermission(id) {
      this.updatePermissionStatus(id, "REJECTED");
    },
  },
};
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
  background-color: #fff7ed;
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
  border-bottom: 1px solid #fde68a;
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
