<template>
  <div :class="['permission-container', { transparente: showForm }]">
    <h2 v-if="!showForm">Mis Permisos</h2>

    <div class="toolbar" v-if="!showForm && permissions.length">
      <div class="control-group">
        <label>Buscar por:</label>
        <select v-model="campoBusqueda" class="select-input">
          <option value="todos">Todos los campos</option>
          <option value="reason">Razón</option>
          <option value="permissionStatus">Estado</option>
          <option value="startTime">Fecha (DD/MM/AAAA)</option>
          <option value="supervisor">Supervisor</option>
        </select>
        <input
          type="text"
          v-model="busqueda"
          :placeholder="placeholderBusqueda"
          class="search-input"
        />
      </div>

      <div class="control-group">
        <label>Ordenar por:</label>
        <select v-model="criterioOrden" class="select-input">
          <option value="reason">Razón</option>
          <option value="permissionStatus">Estado</option>
          <option value="startTime">Fecha</option>
          <option value="supervisor">Supervisor</option>
        </select>
        <button @click="ordenAscendente = !ordenAscendente" class="btn-orden">
          {{ ordenAscendente ? 'Ascendente ▲' : 'Descendente ▼' }}
        </button>
      </div>
    </div>

    <table class="permissions-table" v-if="permissionsFiltrados.length && !showForm">
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
        <tr v-for="perm in permissionsFiltrados" :key="perm.id">
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

    <p v-if="!permissionsFiltrados.length && !showForm" class="no-results">
      No se encontraron permisos que coincidan con la búsqueda.
    </p>

    <div v-if="showForm" class="permission-form">
      <h2>Solicitud de Permiso</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group full-width">
            <label for="reason">Razón del permiso:</label>
            <textarea 
              id="reason" 
              v-model="permission.reason" 
              required 
              minlength="6" 
              maxlength="50" 
              placeholder="Describa brevemente el motivo..."
            ></textarea>
          </div>
          <div class="form-group full-width">
            <label for="startDate">Fecha del permiso:</label>
            <input type="date" id="startDate" v-model="permission.startDate" required />
          </div>
          <div class="form-group">
            <label for="startTime">Hora de inicio:</label>
            <input type="time" id="startTime" v-model="permission.startTime" required />
          </div>
          <div class="form-group">
            <label for="endTime">Hora de finalización:</label>
            <input type="time" id="endTime" v-model="permission.endTime" required />
          </div>
        </div>

        <div class="summary" :class="{ 'texto-error': totalMinutes <= 0 && permission.endTime }">
          <strong>Tiempo total solicitado:</strong> <span>{{ totalMinutes }} minutos</span>
        </div>

        <div class="button-group">
          <button type="button" class="btn-secundario" @click="showForm = false">Volver</button>
          <button type="button" class="btn-secundario" @click="resetForm">Limpiar</button>
          <button type="submit" class="btn-primario" >Enviar Solicitud</button>
        </div>
      </form>
    </div>

    <button v-if="!showForm" @click="showForm = true" class="btn-solicitar-nuevo">
      Solicitar Nuevo Permiso
    </button>
  </div>
</template>

<script>
import { useNotificationStore } from '../../store/useNotificationStore.js';

export default {
  name: "PermissionManager",
  setup() {
    const notificationStore = useNotificationStore();
    return { notificationStore };
  },
  data() {
    return {
      permissions: [],
      showForm: false,
      busqueda: "",
      campoBusqueda: "todos",
      criterioOrden: "startTime",
      ordenAscendente: false,
      permission: { reason: "", startDate: "", startTime: "", endTime: "" },
    };
  },
  computed: {
    placeholderBusqueda() {
      const ops = {
        todos: "Cualquier columna...",
        reason: "Razón del permiso...",
        permissionStatus: "Ej: Approved, Pending...",
        startTime: "DD/MM/AAAA",
        supervisor: "Nombre del supervisor..."
      };
      return ops[this.campoBusqueda];
    },
    totalMinutes() {
      const { startDate, startTime, endTime } = this.permission;
      if (!startDate || !startTime || !endTime) return 0;
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${startDate}T${endTime}`);
      return end > start ? Math.floor((end - start) / 60000) : 0;
    },
    permissionsFiltrados() {
      let filtrados = [...this.permissions];
      if (this.busqueda.trim()) {
        const texto = this.busqueda.toLowerCase();
        filtrados = filtrados.filter(p => {
          const reason = (p.reason || "").toLowerCase();
          const status = (p.permissionStatus || "").toLowerCase();
          const date = this.formatDateOnly(p.startTime);
          const supervisor = p.supervisor 
            ? `${p.supervisor.firstName} ${p.supervisor.lastName}`.toLowerCase()
            : "pendiente";

          if (this.campoBusqueda === 'reason') return reason.includes(texto);
          if (this.campoBusqueda === 'permissionStatus') return status.includes(texto);
          if (this.campoBusqueda === 'startTime') return date.includes(texto);
          if (this.campoBusqueda === 'supervisor') return supervisor.includes(texto);
          return reason.includes(texto) || status.includes(texto) || date.includes(texto) || supervisor.includes(texto);
        });
      }

      filtrados.sort((a, b) => {
        let valA, valB;
        if (this.criterioOrden === 'supervisor') {
          valA = a.supervisor ? `${a.supervisor.firstName} ${a.supervisor.lastName}` : "zzz";
          valB = b.supervisor ? `${b.supervisor.firstName} ${b.supervisor.lastName}` : "zzz";
        } else {
          valA = a[this.criterioOrden];
          valB = b[this.criterioOrden];
        }
        
        if (typeof valA === 'string') {
          const res = valA.toLowerCase().localeCompare(valB.toLowerCase());
          return this.ordenAscendente ? res : -res;
        } else {
          return this.ordenAscendente ? valA - valB : valB - valA;
        }
      });
      return filtrados;
    }
  },
  mounted() { 
    this.fetchPermissions(); 
  },
  methods: {
    normalizeTimestamp(timestamp) {
      if (!timestamp) return 0;
      const tsStr = String(timestamp);
      // Ajuste por si el backend enviara microsegundos, pero tu Read usa toEpochMilli()
      return tsStr.length > 13 ? Math.floor(Number(timestamp) / 1000) : Number(timestamp);
    },

    formatDateOnly(epoch) {
      if (!epoch) return "N/A";
      const d = new Date(this.normalizeTimestamp(epoch));
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    formatTimeOnly(epoch) {
      if (!epoch) return "N/A";
      const d = new Date(this.normalizeTimestamp(epoch));
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    },

    getEndTime(startEpoch, durationMinutes) {
      const startMillis = this.normalizeTimestamp(startEpoch);
      return startMillis + (durationMinutes * 60000);
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
        if (!res.ok) throw new Error("Error al obtener datos");
        const data = await res.json();
        const employeeId = this.getCookie("userid");
        this.permissions = data.filter(p => p.requester?.id === parseInt(employeeId));
      } catch (e) { 
        this.notificationStore.addNotification("Error de Carga", "No se pudieron sincronizar tus permisos.", "error");
      }
    },

    async handleSubmit() {
      const { reason, startDate, startTime, endTime } = this.permission;
      
      // 1. Validación de campos obligatorios
      if (!reason || !startDate || !startTime || !endTime) {
        this.notificationStore.addNotification("Campos Incompletos", "Por favor, completa todos los campos.", "warning");
        return;
      }

      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${startDate}T${endTime}`);
      const duration = this.totalMinutes;

      // 2. Validación de fecha pasada (Regla: Instant.now().minus(1 min))
      if (startDateTime < (new Date() - 60000)) {
        this.notificationStore.addNotification("Fecha Inválida", "La fecha de inicio no puede ser anterior a la actual.", "warning");
        return;
      }

      // 3. Validación de duración (Regla: [60, 480] minutos)
      if (duration < 60 || duration > 480) {
        this.notificationStore.addNotification("Duración Inválida", "La duración debe ser de entre 1 y 8 horas.", "warning");
        return;
      }

      // 4. Validación de hora de fin (Regla: No exceder las 17:00)
      if (endDateTime.getHours() > 17 || (endDateTime.getHours() === 17 && endDateTime.getMinutes() > 0)) {
        this.notificationStore.addNotification("Límite Horario", "La hora de finalización no puede exceder las 17:00.", "warning");
        return;
      }

      const employeeId = this.getCookie("userid");
      
      const payload = {
        reason: reason,
        // Tu Servicio usa Instant.ofEpochMilli, así que enviamos milisegundos
        startTime: startDateTime.getTime(), 
        duration: duration,
        requesterId: parseInt(employeeId)
      };

      try {
        const response = await fetch("http://localhost:8080/absence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          this.notificationStore.addNotification("Solicitud Enviada", "Tu permiso ha sido registrado con éxito.", "success");
          this.showForm = false;
          this.resetForm(false);
          await this.fetchPermissions();
        } else {
          // El servicio devuelve HttpResult con un mensaje en texto plano o JSON
          const errorText = await response.text();
          let msg = errorText;
          try { 
            const errorJson = JSON.parse(errorText);
            msg = errorJson.message || msg;
          } catch(e) { /* no es json */ }
          
          throw new Error(msg || "Error en el servidor");
        }
      } catch (e) {
        this.notificationStore.addNotification("Error", e.message, "error");
      }
    },

    resetForm(showNotice = true) { 
      this.permission = { reason: "", startDate: "", startTime: "", endTime: "" };
      if (showNotice) {
        this.notificationStore.addNotification("Formulario Limpio", "Los campos han sido reiniciados.", "info");
      }
    }
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

/* --- ESTILOS GENERALES --- */
.permission-container { 
  background-color: #f0fdf4; /* Verde muy claro de fondo */
  padding: 2rem; 
  font-family: "Inter", sans-serif; 
  min-height: 100vh; 
  display: flex; 
  flex-direction: column; 
  gap: 1.5rem; 
}

h2 { 
  color: #166534; /* Verde oscuro (Encabezados) */
  text-align: center; 
  margin-bottom: 1rem;
}

/* --- TOOLBAR --- */
.toolbar { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  background: #fff; 
  padding: 1rem; 
  border-radius: 12px; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); 
  flex-wrap: wrap; 
  gap: 1rem; 
  border: 1px solid #a7f3d0;
}
.control-group { display: flex; align-items: center; gap: 0.75rem; }
.control-group label { font-weight: 600; color: #065f46; font-size: 0.85rem; }

/* Inputs Generales (Búsqueda y Selects) */
.select-input, .search-input { 
  padding: 0.5rem; 
  border: 1px solid #a7f3d0; 
  border-radius: 8px; 
  outline: none; 
  color: #1e293b;
}
.select-input:focus, .search-input:focus {
  border-color: #34d399;
}

.btn-orden { 
  background-color: #10b981; 
  color: white; 
  border: none; 
  padding: 0.5rem 1rem; 
  border-radius: 8px; 
  cursor: pointer; 
  font-weight: 600; 
}

/* --- TABLA --- */
.permissions-table { 
  width: 100%; 
  border-collapse: collapse; 
  background: white; 
  border-radius: 12px; 
  overflow: hidden; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); 
  border: 1px solid #e2e8f0;
}
.permissions-table th, .permissions-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #f0fdf4; }
.permissions-table thead { background-color: #ecfdf5; color: #065f46; font-weight: 600; }

.badge { padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; text-transform: capitalize; }
.badge.pending { background-color: #fef3c7; color: #92400e; }
.badge.approved { background-color: #d1fae5; color: #065f46; }
.badge.rejected { background-color: #fee2e2; color: #991b1b; }

/* --- FORMULARIO (ESTILO PRODUCT-FORM APLICADO) --- */
.permission-form { 
  background-color: #f0fdf4; /* Fondo verde muy suave */
  padding: 2rem; 
  border-radius: 12px; 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
  max-width: 700px; 
  margin: 0 auto; 
  width: 100%; 
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 1px solid #dcfce7;
}

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.full-width { grid-column: span 2; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }

/* Etiquetas estilo Product-Form */
.form-group label { 
  font-weight: 600; 
  color: #065f46; /* Verde bosque */
}

/* Inputs y Textareas estilo Product-Form */
.form-group textarea, .form-group input { 
  padding: 0.75rem; 
  border: 1px solid #a7f3d0; /* Borde verde claro */
  border-radius: 8px; 
  font-size: 1rem;
  background-color: #fff;
  color: #1e293b;
  transition: border-color 0.3s ease;
  font-family: inherit; 
  
}

.form-group textarea:focus, .form-group input:focus {
  outline: none;
  border-color: #34d399; /* Foco verde vibrante */
}

/* Resumen */
.summary { 
  padding: 1rem; 
  background: #ffffff; 
  border: 1px  #a7f3d0;
  border-radius: 8px; 
  text-align: center; 
  color: #166534;
  margin-top: 20px;
}
.texto-error { color: #ef4444; font-weight: bold; }

/* --- BOTONES DEL FORMULARIO --- */
.button-group { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }

button {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  transition: background-color 0.3s;
}

/* Botones Secundarios (Volver, Limpiar) */
.btn-secundario { 
  background-color: #d1fae5; 
  color: #065f46; 
}
.btn-secundario:hover { 
  background-color: #a7f3d0; 
}

/* Botón Primario (Enviar) */
.btn-primario { 
  background-color: #10b981; 
  color: white; 
}
.btn-primario:hover:not(:disabled) { 
  background-color: #059669; 
}


/* Botón Flotante/Externo */
.btn-solicitar-nuevo { 
  align-self: center; 
  background-color: #10b981; 
  color: white; 
  padding: 1rem 2rem; 
  border: none; 
  border-radius: 12px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: transform 0.2s, background-color 0.3s; 
}
.btn-solicitar-nuevo:hover { 
  transform: scale(1.05); 
  background-color: #059669;
}

.no-results { text-align: center; font-style: italic; color: #64748b; margin-top: 1rem; }
</style>
