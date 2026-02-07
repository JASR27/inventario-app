<template>
    <div class="permission-form">
        <h2>Solicitud de Permiso</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-grid">
                <!-- Razón ocupa toda la fila -->
                <div class="form-group full-width">
                    <label for="reason">Razón del permiso:</label>
                    <textarea id="reason" v-model="permission.reason" required></textarea>
                </div>

                <!-- Fecha y hora de inicio en la misma fila -->
                <div class="form-group">
                    <label for="startDate">Fecha de inicio:</label>
                    <input type="date" id="startDate" v-model="permission.startDate" required />
                </div>
                <div class="form-group">
                    <label for="startTime">Hora de inicio:</label>
                    <input type="time" id="startTime" v-model="permission.startTime" required />
                </div>

                <!-- Fecha y hora de finalización en la misma fila -->
                <div class="form-group">
                    <label for="endDate">Fecha de finalización:</label>
                    <input type="date" id="endDate" v-model="permission.endDate" required />
                </div>
                <div class="form-group">
                    <label for="endTime">Hora de finalización:</label>
                    <input type="time" id="endTime" v-model="permission.endTime" required />
                </div>
            </div>

            <div class="summary">
                <strong>Tiempo total fuera (horas laborales):</strong>
                <span>{{ totalHours }} horas</span>
            </div>

            <div class="button-group">
                <button type="button" @click="resetForm">Limpiar</button>
                <button type="submit">Solicitar</button>
            </div>
        </form>
    </div>
</template>

<script>
export default {
    name: "PermissionForm",
    data() {
        return {
            permission: {
                reason: "",
                startDate: "",
                startTime: "",
                endDate: "",
                endTime: "",
            },
        };
    },
    computed: {
        totalHours() {
            const { startDate, startTime, endDate, endTime } = this.permission;
            if (!startDate || !startTime || !endDate || !endTime) return 0;

            const start = new Date(`${startDate}T${startTime}`);
            const end = new Date(`${endDate}T${endTime}`);

            if (end <= start) return 0;

            const workStart = 9;
            const workEnd = 17;

            let total = 0;
            let current = new Date(start);

            while (current < end) {
                const dayStart = new Date(current);
                dayStart.setHours(workStart, 0, 0, 0);

                const dayEnd = new Date(current);
                dayEnd.setHours(workEnd, 0, 0, 0);

                const actualStart = current > dayStart ? current : dayStart;
                const actualEnd = end < dayEnd ? end : dayEnd;

                if (actualEnd > actualStart) {
                    total += (actualEnd - actualStart) / (1000 * 60 * 60); // horas
                }

                current.setDate(current.getDate() + 1);
                current.setHours(0, 0, 0, 0);
            }

            return total.toFixed(2);
        },
    },
    methods: {
        handleSubmit() {
            const { startDate, startTime, endDate, endTime } = this.permission;

            const now = new Date();
            const start = new Date(`${startDate}T${startTime}`);
            const end = new Date(`${endDate}T${endTime}`);

            if (start <= now) {
                alert("La fecha y hora de inicio deben ser posteriores al momento actual.");
                return;
            }

            if (end <= start) {
                alert("La fecha y hora de finalización deben ser posteriores a las de inicio.");
                return;
            }

            alert(`Permiso solicitado por ${this.totalHours} horas laborales.`);
            console.log("Datos del permiso:", this.permission);
            this.resetForm();
        },
        resetForm() {
            this.permission = {
                reason: "",
                startDate: "",
                startTime: "",
                endDate: "",
                endTime: "",
            };
        },
    },
};
</script>

<style scoped>
.permission-form {
    background-color: #f0fdf4;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: "Inter", sans-serif;
    max-width: 700px;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.permission-form h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    color: #166534;
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
}

.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

button {
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-family: "Inter", sans-serif;
}

button[type="submit"] {
    background-color: #10b981;
    color: white;
}

button[type="submit"]:hover {
    background-color: #059669;
}

button[type="button"] {
    background-color: #d1fae5;
    color: #065f46;
}

button[type="button"]:hover {
    background-color: #a7f3d0;
}

.full-width {
    grid-column: span 2;
}
</style>
