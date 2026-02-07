<template>
  <div :class="['permission-container', { transparente: showForm }]">
    <h2 v-if="!showForm">Mis Permisos</h2>

    <!-- Tabla de permisos -->
    <table class="permissions-table" v-if="permissions.length && !showForm">
      <thead>
        <tr>
          <th>Razón</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Hora de inicio</th>
          <th>Hora de fin</th>
          <th>Supervisor</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="perm in permissions" :key="perm.id">
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
            {{ perm.supervisor
              ? perm.supervisor.firstName + ' ' + perm.supervisor.lastName
              : 'Pendiente' }}
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!permissions.length && !showForm">No tienes permisos solicitados.</p>

    <!-- Formulario de solicitud -->
    <div v-if="showForm" class="permission-form">
      <h2>Solicitud de Permiso</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group full-width">
            <label for="reason">Razón del permiso:</label>
            <textarea id="reason" v-model="permission.reason" required minlength="6" maxlength="20"
              pattern="[A-Za-z0-9 ._-]{6,20}"
              title="Debe tener entre 6 y 20 caracteres. Solo se permiten letras, números, espacios y .-_"></textarea>
          </div>

          <div class="form-group full-width">
            <label for="startDate">Fecha de inicio:</label>
            <input type="date" id="startDate" v-model="permission.startDate" required />
          </div>
          <div class="form-group full-width">
            <label for="startTime">Hora de inicio:</label>
            <input type="time" id="startTime" v-model="permission.startTime" required min="09:00" max="17:00"
              step="60" />
          </div>

          <div class="form-group full-width">
            <label for="endTime">Hora de finalización:</label>
            <input type="time" id="endTime" v-model="permission.endTime" required min="09:00" max="17:00" step="60" />
          </div>
        </div>

        <div class="summary">
          <strong>Tiempo total fuera:</strong>
          <span>{{ totalMinutes }} minutos</span>
        </div>

        <div class="button-group">
          <button type="button" @click="showForm = false">Volver</button>
          <button type="button" @click="resetForm">Limpiar</button>
          <button type="submit">Solicitar</button>

        </div>
      </form>
    </div>

    <!-- Botón exterior solo si no se muestra el formulario -->
    <button v-if="!showForm" @click="showForm = true; scrollToForm()">
      Solicitar Permiso
    </button>
  </div>
</template>

<script>
export default {
  name: "PermissionManager",
  data() {
    return {
      permissions: [],
      showForm: false,
      permission: {
        reason: "",
        startDate: "",
        startTime: "",
        endTime: "",
      },
    };
  },
  computed: {
    totalMinutes() {
      const { startDate, startTime, endTime } = this.permission;
      if (!startDate || !startTime || !endTime) return 0;
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${startDate}T${endTime}`);
      if (end <= start) return 0;
      return Math.floor((end - start) / (1000 * 60));
    },
  },
  mounted() {
    this.fetchPermissions();
  },
  methods: {
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },
    formatEndDateTime(startTime, durationMinutes) {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + durationMinutes * 60000);
      return end.toLocaleString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },
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
        const employeeId = this.getCookie("userid");

        this.permissions = data
          .filter((p) => p.requester?.id === parseInt(employeeId))
          .map((p) => ({
            ...p,
            startTime: Number(p.startTime) / 1000, // convierte de microsegundos a milisegundos
          }))
          .sort((a, b) => b.startTime - a.startTime);
      } catch (e) {
        console.error("Error cargando permisos:", e);
      }
    }
    ,
    async handleSubmit() {
      const { startDate, startTime, endTime, reason } = this.permission;
      const now = new Date();
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${startDate}T${endTime}`);

      // Validaciones (igual que antes)
      if (start <= now) {
        alert("La fecha y hora de inicio deben ser posteriores al momento actual.");
        return;
      }
      if (end <= start) {
        alert("La hora de finalización debe ser posterior a la de inicio.");
        return;
      }

      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();
      const minAllowed = 9 * 60;
      const maxAllowed = 17 * 60;

      // Validación de razón
      const reasonRegex = /^[A-Za-z0-9 ._-]{6,20}$/;
      if (!reasonRegex.test(reason)) {
        alert("La razón debe tener entre 6 y 20 caracteres y solo puede contener letras, números, espacios y .-_");
        return;
      }

      // Validación de fecha no posterior a 3 meses
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3);
      if (start > maxDate) {
        alert("La fecha de inicio no puede ser posterior a 3 meses desde hoy.");
        return;
      }

      if (
        startMinutes < minAllowed ||
        startMinutes > maxAllowed ||
        endMinutes < minAllowed ||
        endMinutes > maxAllowed
      ) {
        alert("Las horas deben estar entre las 09:00 y las 17:00 en punto.");
        return;
      }

      if (this.totalMinutes < 60) {
        alert("El tiempo mínimo de un permiso debe ser de 60 minutos.");
        return;
      }
      if (this.totalMinutes > 480) {
        alert("El tiempo total fuera no puede ser mayor a 480 minutos (8 horas).");
        return;
      }

      const employeeId = this.getCookie("userid");
      if (!employeeId) {
        alert("No se encontró el ID del empleado en las cookies.");
        return;
      }

      // 🔹 Aquí el cambio importante: usamos getTime() en lugar de toISOString()
      const body = {
        reason,
        startTime: start.getTime(),   // epoch en milisegundos
        duration: this.totalMinutes,
        requesterId: parseInt(employeeId),
      };

      try {
        const res = await fetch("http://localhost:8080/absence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        await res.json();
        alert("Permiso solicitado correctamente.");
        this.resetForm();
        this.showForm = false;
        this.fetchPermissions();
      } catch (e) {
        console.error("Error enviando permiso:", e);
        alert("No se pudo enviar la solicitud de permiso.");
      }
    },
    resetForm() {
      this.permission = {
        reason: "",
        startDate: "",
        startTime: "",
        endTime: "",
      };
    },
  },
};
</script>


<style scoped>
.permission-container {
  background-color: #f0fdf4;
  padding: 2rem;
  font-family: "Inter", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-sizing: border-box;
  min-height: 100vh;
}

.transparente {
  background-color: transparent !important;
}

.permission-container h2 {
  font-size: 1.6rem;
  color: #166534;
  text-align: center;
  margin-bottom: 1rem;
}

/* Tabla de permisos */
.permissions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  table-layout: fixed;
}

.permissions-table thead {
  background-color: #d1fae5;
  color: #065f46;
}

.permissions-table th,
.permissions-table td {
  width: 16.66%;
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  word-wrap: break-word;
}

.permissions-table tr:hover {
  background-color: #ecfdf5;
  cursor: pointer;
}

/* Botón para mostrar formulario */
.permission-container>button {
  align-self: flex-end;
  background-color: #d1fae5;
  color: #065f46;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.permission-container>button:hover {
  background-color: #a7f3d0;
}

/* Formulario */
.permission-form {
  background-color: #f0fdf4;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  margin: auto;
  margin-top: 0;

  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.permission-form h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #166534;
  text-align: center;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.permission-form label {
  font-weight: 600;
  color: #065f46;
  margin-bottom: 0.5rem;
}

.permission-form input,
.permission-form textarea {
  padding: 0.75rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #1e293b;
  transition: border-color 0.3s ease;
}

.permission-form input:focus,
.permission-form textarea:focus {
  outline: none;
  border-color: #34d399;
}

.summary {
  font-size: 1.1rem;
  color: #065f46;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

button[type="submit"] {
  background-color: #10b981;
  color: white;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background-color: #059669;
}

button[type="button"] {
  background-color: #d1fae5;
  color: #065f46;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="button"]:hover {
  background-color: #a7f3d0;
}

.full-width {
  grid-column: span 2;
}

/* Badge para estados */
.badge {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
</style>
