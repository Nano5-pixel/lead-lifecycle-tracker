# Contexto del Proyecto: Lead Lifecycle Tracker v2

Documento generado para proporcionar una visión técnica y funcional completa del sistema.

---

## 1. Estructura del Proyecto
- **Nombre:** Lead Lifecycle Tracker
- **Versión:** 2.0.0
- **Tecnologías Principales:**
  - **Framework:** Next.js 14 (App Router)
  - **Lenguaje:** TypeScript
  - **Backend:** Firebase (Auth + Firestore) + API REST manual para Admin/Ingesta
  - **Estilo:** Tailwind CSS + Framer Motion (animaciones) + Lucide (iconos)
  - **Componentes UI:** Glassmorphism custom components
  - **Drag & Drop:** `@dnd-kit` (core, sortable)

### Estructura de carpetas:
- `app/`: Rutas, páginas y rutas de API.
- `components/`: Componentes React organizados por dominio (auth, kanban, stats, ui).
- `hooks/`: Hooks personalizados (`useAuth`, `useLeads`, `useClientes`).
- `lib/`: Configuración de Firebase, reglas de negocio (`rules.ts`), utilidades (`utils.ts`).
- `types/`: Definiciones de interfaces TypeScript.
- `public/`: Assets estáticos y PWA manifest.

---

## 2. Esquema de Datos (Firestore)
El sistema utiliza una estructura jerárquica para aislar los datos por agencia y cliente.

### Colecciones Principales:
- `agencias/`: Una para cada socio (white-label).
  - Campos: `nombre`, `email`, `plan`, `estadoLicencia` (activo/inactivo), `apiKey`, `creadoEn`.
- `agencias/{agenciaId}/clientes/`: Clientes finales de la agencia.
  - Campos: `nombre`, `fuente`, `creadoEn`.
- `agencias/{agenciaId}/clientes/{clienteId}/leads/`: Leads del cliente.
  - Campos: `nombre`, `telefono`, `email`, `fuente`, `etapa`, `motivoCaida`, `notas`, `fechaEntrada`, `fechaUltimoCambio`, `diasEnEtapa`, `gestionadoPor`.
- `usuarios/`: Mapeo de perfiles Auth a roles y permisos.
  - Campos: `email`, `nombre`, `rol` (super_admin, agencia, cliente), `agenciaId`, `clienteId`.

### Ejemplo de Documento (Lead):
```json
{
  "nombre": "Juan Pérez",
  "telefono": "+52 555 123 4567",
  "email": "juan@ejemplo.com",
  "etapa": "Nuevo",
  "fuente": "Facebook Ads",
  "preCalificado": false,
  "contratoFirmado": false,
  "diasEnEtapa": 2,
  "fechaEntrada": "2026-03-15T10:00:00Z"
}
```

---

## 3. Features Implementadas ✅
- **Autenticación Multitenant:** Login con redirección automática basada en rol.
- **Panel Admin:** Gestión global de agencias y licencias.
- **Panel Agencia:** Selector de clientes y supervisión de leads.
- **Kanban Interactivo:** Drag & drop entre etapas, filtros de búsqueda, y panel lateral de edición.
- **Acciones Rápidas:** Botones directos para Llamar y WhatsApp.
- **API de Ingesta:** Endpoint `/api/leads/ingest` para recibir leads desde Make.com/Webhooks.
- **Restricción de Licencia:** Overlay que bloquea el sistema si la licencia está inactiva.

---

## 4. Features en Desarrollo 🔧
- **Botón de copiado:** Agregar funcionalidad para copiar `clienteId` en el panel de agencia.
- **Visualización de API Key:** Mostrar la clave real de la agencia en lugar de un placeholder.
- **Sincronización de Analítica:** Hacer que la vista de estadísticas se actualice reactivamente sin recargar.
- **Refactorización Admin SDK:** Transición de `firebase-admin` a REST API para evitar dependencias pesadas en Vercel.

---

## 5. Reglas y Validaciones Críticas
- **Seguridad Firestore:** Actualmente en modo de prueba, pero diseñado para jerarquía (`agenciaId` -> `clienteId`).
- **RULE-07 (Doble Compuerta):** Lógica que requiere campos específicos (pre-calificación) para avanzar a etapas avanzadas (Propuesta/Ganado). *Nota: Actualmente relajada para flexibilidad total en UI.*
- **RULE-10 (Control Remoto):** Verificación forzada del campo `estadoLicencia`. Si es `inactivo`, el acceso es denegado preventivamente.
- **Validación de Ingesta:** La API exige `apiKey` válida y que el `clienteId` pertenezca a la agencia asociada.

---

## 6. Componentes React Principales
- `KanbanBoard`: El "motor" visual. Maneja el estado de `dnd-kit` y las transiciones entre columnas.
- `AuthGuard`: Componente de alto nivel que protege rutas validando el rol del usuario en Firestore.
- `LeadCard`: Representación visual compacta de un lead con indicadores de tiempo y fuente.
- `LeadDetailPanel`: Slide-over lateral para editar toda la información del lead sin perder el contexto del pipeline.
- `StatsOverview`: Componente de analítica que procesa el array de leads para calcular tasas de conversión y eficiencia.
- `ClienteSelector`: Grid interactivo para que las agencias cambien entre las vistas de sus distintos clientes.

---

## 7. Integraciones Externas
- **Make.com:** Conecta Facebook Lead Ads con nuestra API de ingesta.
- **Google Sheets:** (Opcional/Planificado) Para backup o reporting avanzado.
- **WhatsApp API:** Enlaces dinámicos generados vía `whatsappLink(phone, name)`.
- **Identity Toolkit API:** Usada en el backend para gestionar usuarios Auth sin el SDK completo.

---

## 8. Código Crítico
- `lib/rules.ts`: Función `calculateStats` que centraliza toda la lógica de cálculo de KPIs.
- `app/api/leads/ingest/route.ts`: Implementación manual de JWT y Auth de Google para hablar con Firestore vía REST. **Clave para escalabilidad y bypass de SDK.**
- `hooks/useLeads.ts`: Implementación de `onSnapshot` de Firebase para actualizaciones en tiempo real del pipeline.

---
*Este documento es dinámico y debe actualizarse ante cambios significativos en la arquitectura.*
