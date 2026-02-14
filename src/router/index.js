import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/Generic Views/LoginView.vue'
import DashboardView from '../views/Generic Views/DashboardView.vue'
import DashboardUser from '../views/User Views/DashboardUser.vue'
import DashboardAdmin from '../views/Admin Views/DashboardAdmin.vue'
import CreateUserView from '../views/Admin Views/CreateUserView.vue'
import EditUserView from '../views/Admin Views/EditUserView.vue'
import DeleteUserView from '../views/Admin Views/DeleteUserView.vue'
import PermissionApproval from '../views/Admin Views/PermissionApprovalView.vue'
import CreateProductView from '../views/User Views/CreateProductView.vue'
import CreateClientView from '../views/User Views/CreateClientView.vue'
import CreateProviderView from '../views/User Views/CreateProviderView.vue'
import PermissionRegisterView from '../views/User Views/PermissionRegisterView.vue'
import AsistanceRegisterView from '../views/User Views/AsistanceRegisterView.vue'
import GraphicView from '../views/Admin Views/GraphicView.vue'
import ShoppingCartView from '../views/User Views/ShoppingCartView.vue'
import RepositionView from '../views/User Views/RepositionView.vue'
import RefundView from '../views/User Views/RefundView.vue'
import InventoryView from '../views/User Views/InventoryView.vue'
import InventoryAdminView from '../views/Admin Views/InventoryAdminView.vue'
import TransactionsView from '../views/Admin Views/TransactionsView.vue'
import AdjusmentView from '../views/Admin Views/AdjusmentView.vue'
import ProductGraphicView from '../views/Admin Views/ProductGraphicView.vue'
import AbsenseGraphicView from '../views/Admin Views/AbsenseGraphicView.vue'

const routes = [
  { path: '/', component: LoginView },

  { path: '/dashboard', component: DashboardView, meta: { requiereAuth: true } },

  // Empleado
  { path: '/dashboard/empleado', component: DashboardUser, meta: { requiereAuth: true, rol: 'empleado' } },
  { path: '/dashboard/empleado/inventory', component: InventoryView, meta: { requiereAuth: true, rol: 'empleado' } },
  { path: '/dashboard/empleado/registerProduct', component: CreateProductView, meta: { requiereAuth: true, rol: 'empleado' } },
  { path: '/dashboard/empleado/registerReposition', component: RepositionView, meta: { requiereAuth: true, rol: 'empleado' } },
  { path: '/dashboard/empleado/registerProvider', component: CreateProviderView, meta: { requiereAuth: true, rol: 'empleado' } },
  { path: '/dashboard/empleado/Sale', component: ShoppingCartView, meta: { requiereAuth: true, rol: 'empleado' } },
  { path: '/dashboard/empleado/Refund', component: RefundView, meta: { requiereAuth: true, rol: 'empleado' } },
  { path: '/dashboard/empleado/registerClient', component: CreateClientView, meta: { requiereAuth: true, rol: 'empleado' } },
  { path: '/dashboard/empleado/registerPermission', component: PermissionRegisterView, meta: { requiereAuth: true, rol: 'empleado' } },
  { path: '/dashboard/empleado/registerAssistance', component: AsistanceRegisterView, meta: { requiereAuth: true, rol: 'empleado' } },

  // Admin
  { path: '/dashboard/admin', component: DashboardAdmin, meta: { requiereAuth: true, rol: 'admin' } },
  { path: '/dashboard/admin/createUser', component: CreateUserView, meta: { requiereAuth: true, rol: 'admin' } },
  { path: '/dashboard/admin/editUser', component: EditUserView, meta: { requiereAuth: true, rol: 'admin' } },
  { path: '/dashboard/admin/deleteUser', component: DeleteUserView, meta: { requiereAuth: true, rol: 'admin' } },
  { path: '/dashboard/admin/permissions', component: PermissionApproval, meta: { requiereAuth: true, rol: 'admin' } },
  { path: '/dashboard/admin/saleCharts', component: GraphicView, meta: { requiereAuth: true, rol: 'admin' } },
  { path: '/dashboard/admin/productCharts', component: ProductGraphicView, meta: { requiereAuth: true, rol: 'admin' } },
  { path: '/dashboard/admin/absenceCharts', component: AbsenseGraphicView, meta: { requiereAuth: true, rol: 'admin' } },
  { path: '/dashboard/admin/inventory', component: InventoryAdminView, meta: { requiereAuth: true, rol: 'admin' } },
  { path: '/dashboard/admin/transactions', component: TransactionsView, meta: { requiereAuth: true, rol: 'admin' } },
  { path: '/dashboard/admin/adjustment', component: AdjusmentView, meta: { requiereAuth: true, rol: 'admin' } }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guardia global
router.beforeEach((to, from, next) => {
  const requiereAuth = to.meta.requiereAuth
  const rolRequerido = to.meta.rol
  const autenticado = localStorage.getItem('autenticado') === 'true'
  const rolUsuario = localStorage.getItem('rol')

  if (requiereAuth && !autenticado) {
    next('/') // No autenticado
  } else if (requiereAuth && rolRequerido && rolUsuario !== rolRequerido) {
    next('/') // Rol incorrecto
  } else if (to.path === '/' && autenticado) {
    // Redirección automática si ya está logueado
    rolUsuario === 'admin'
      ? next('/dashboard/admin')
      : next('/dashboard/empleado')
  } else {
    next() // Acceso permitido
  }
})



