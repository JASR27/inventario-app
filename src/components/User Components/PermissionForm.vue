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
            <textarea id="reason" v-model="permission.reason" required minlength="6" maxlength="20"></textarea>
          </div>
          <div class="form-group full-width">
            <label for="startDate">Fecha de inicio:</label>
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

        <div class="summary">
          <strong>Tiempo total fuera:</strong> <span>{{ totalMinutes }} minutos</span>
        </div>

        <div class="button-group">
          <button type="button" @click="showForm = false">Volver</button>
          <button type="button" @click="resetForm">Limpiar</button>
          <button type="submit">Solicitar</button>
        </div>
      </form>
    </div>

    <button v-if="!showForm" @click="showForm = true" class="btn-solicitar">
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
      busqueda: "",
      campoBusqueda: "todos",
      criterioOrden: "startTime", // Por defecto ordena por fecha
      ordenAscendente: false,      // Más reciente primero
      permission: { reason: "", startDate: "", startTime: "", endTime: "" },
    };
  },
  computed: {
    placeholderBusqueda() {
      const ops = {
        todos: "Buscar en cualquier columna...",
        reason: "Filtrar por razón...",
        permissionStatus: "Ej: Approved, Pending...",
        startTime: "Formato: DD/MM/AAAA...",
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

      // 1. Lógica de Filtrado
      if (this.busqueda.trim()) {
        const texto = this.busqueda.toLowerCase();
        filtrados = filtrados.filter(p => {
          const reason = (p.reason || "").toLowerCase();
          const status = (p.permissionStatus || "").toLowerCase();
          const date = this.formatDateOnly(p.startTime); // "DD/MM/YYYY"
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

      // 2. Lógica de Ordenamiento
      filtrados.sort((a, b) => {
        let valA, valB;

        // Extraer valores según el criterio
        if (this.criterioOrden === 'supervisor') {
          valA = a.supervisor ? `${a.supervisor.firstName} ${a.supervisor.lastName}` : "zzz";
          valB = b.supervisor ? `${b.supervisor.firstName} ${b.supervisor.lastName}` : "zzz";
        } else {
          valA = a[this.criterioOrden];
          valB = b[this.criterioOrden];
        }

        // Comparación
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
  mounted() { this.fetchPermissions(); },
  methods: {
    formatDateOnly(epochMillis) {
      const d = new Date(Number(epochMillis));
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },
    formatTimeOnly(epochMillis) {
      const d = new Date(Number(epochMillis));
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    },
    getEndTime(startMillis, durationMinutes) {
      return Number(startMillis) + (durationMinutes * 60000);
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
        const data = await res.json();
        const employeeId = this.getCookie("userid");
        this.permissions = data
          .filter(p => p.requester?.id === parseInt(employeeId))
          .map(p => ({ ...p, startTime: Number(p.startTime) / 1000 }));
      } catch (e) { console.error(e); }
    },
    async handleSubmit() {
      // ... (tu lógica de submit se mantiene igual)
    },
    resetForm() { this.permission = { reason: "", startDate: "", startTime: "", endTime: "" }; }
  }
};
</script>

<style scoped>
/* Estilos unificados con Toolbar */
h2 { color: #166534; text-align: center;}
.permission-container { background-color: #f0fdf4; padding: 2rem; font-family: "Inter", sans-serif; min-height: 100vh; display: flex; flex-direction: column; gap: 1.5rem; }
.toolbar { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 1rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); flex-wrap: wrap; gap: 1rem; }
.control-group { display: flex; align-items: center; gap: 0.75rem; }
.control-group label { font-weight: 600; color: #374151; font-size: 0.85rem; }
.select-input, .search-input { padding: 0.5rem; border: 1px solid #a7f3d0; border-radius: 8px; outline: none; }
.btn-orden { background-color: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
.permissions-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.permissions-table th, .permissions-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.permissions-table thead { background-color: #d1fae5; color: #065f46; }
.badge { padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.badge.pending { background-color: #fef3c7; color: #92400e; }
.badge.approved { background-color: #d1fae5; color: #065f46; }
.badge.rejected { background-color: #fee2e2; color: #991b1b; }
.btn-solicitar { align-self: flex-end; background-color: #d1fae5; color: #065f46; padding: 0.8rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.no-results { text-align: center; font-style: italic; color: #64748b; margin-top: 1rem; }
</style>
