# PlatformOps & Product Feedback Hub — Portal Web Corporativo

![Angular](https://img.shields.io/badge/Angular-21.2-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![AWS CloudFront](https://img.shields.io/badge/AWS_CloudFront-Global_CDN-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Amazon S3](https://img.shields.io/badge/Amazon_S3-Hosting_OAC-569A31?style=for-the-badge&logo=amazon-s3&logoColor=white)

> Consola de operaciones web y gestión integral de feedback de producto para **TuNegocio.pe** (Proveedor SaaS de Facturación Electrónica y Gestión Comercial para más de 10 000 pymes).
> Proyecto integrador desarrollado para el Instituto de Educación Superior **IDAT** — Carrera de Desarrollo de Sistemas de Información (VI Ciclo).

---

## 🌐 Despliegue en Producción (AWS Cloud)

* **Portal Web Corporativo (CloudFront CDN):** [https://d77t0uv3b5km5.cloudfront.net](https://d77t0uv3b5km5.cloudfront.net)
* **Backend API Gateway v2 (.NET 10):** `https://193b69gfya.execute-api.us-east-2.amazonaws.com/api/v1`
* **Base de Datos:** Amazon RDS MySQL 8.4 LTS Multi-AZ (`idat-db.c74eeukcmp7z.us-east-2.rds.amazonaws.com`)
* **Autenticación e Identidad:** AWS Cognito User Pool (`us-east-2_5QCZKDuMi`)

---

## 🛠️ Stack Tecnológico

| Capa / Componente | Tecnología | Descripción |
|---|---|---|
| **Framework Web** | Angular 21 (Standalone Components) | Reactividad granular con **Angular Signals** (`signal`, `computed`, `effect`), Change Detection `OnPush` y nuevo Control Flow (`@if`, `@for`, `@switch`). |
| **Estilos & Diseño** | Tailwind CSS + Lucide Icons | Design System corporativo **Obsidian Telemetry** en modo oscuro de alta precisión para operaciones técnicas. |
| **Componentes Avanzados** | Angular CDK (`@angular/cdk/drag-drop`) | Tablero Kanban interactivo con drag-and-drop para priorización de Roadmap y matriz RICE. |
| **Seguridad & RBAC** | Interceptores funcionales & Route Guards | Manejo automático de Bearer Tokens JWT, control estricto de roles (`roleGuard`) y resolución de concurrencia optimista (`HTTP 409 Conflict`). |
| **Infraestructura Cloud** | Amazon S3 + CloudFront CDN + OAC | Alojamiento en bucket privado con Origin Access Control, compresión Brotli, reescritura SPA y control estricto de caché (`no-cache` en `index.html`). |

---

## ✨ Módulos de la Aplicación

1. **Dashboard Operativo & KPIs:** Visión en tiempo real de tickets críticos (P1/P2), clientes activos, ARR contractual bajo monitoreo y salud de infraestructura AWS.
2. **Core de Incidentes (Tickets):** Registro, asignación a ingenieros, adjuntos multimedia en Amazon S3, trazabilidad de estados y diálogo interactivo ante colisiones de bloqueo optimista (`HTTP 409 Conflict`).
3. **Product Feedback & Roadmap Kanban:** Sugerencias de clientes vinculadas a impacto comercial (ARR), votación ponderada y tablero Kanban por etapas (`PROPUESTO`, `ANALISIS`, `EN_DESARROLLO`, `LANZADO`).
4. **Clientes SaaS & Ficha 360°:** Directorio de empresas clientes, contactos autorizados, notas comerciales y semáforo de riesgo de retención (Churn Risk).
5. **Avisos de Sistema & Changelog:** Banners interactivos para alertas operativas mayores (ej. degradación de pasarelas) y línea de tiempo de notas de versiones desplegadas.
6. **Operaciones, SLAs & Auditoría:** Desglose dinámico de cumplimiento de SLAs por plan SaaS (`ENTERPRISE`, `PROFESSIONAL`, `STARTER`, `CUSTOM`), telemetría de 6 servicios de AWS en `us-east-2` y visor forense de `logs_actividad`.
7. **Administración & Organización (RBAC):** Módulo reservado para el rol `ADMIN` para gestión de colaboradores internos, departamentos organizacionales y auditoría de accesos.

---

## 🚀 Ejecución y Comandos

### Prerrequisitos
* Node.js v20.x o superior
* npm v10.x o superior
* Angular CLI v21.x (`npm install -g @angular/cli`)

### Instalación de Dependencias
```bash
npm install
```

### Servidor de Desarrollo
Inicia el servidor local conectado directamente a la API en producción en AWS:
```bash
npm start
# o: ng serve
```
Navega a `http://localhost:4200/`. La aplicación recarga automáticamente ante cualquier cambio.

### Compilación para Producción
```bash
npm run build
```
Genera los artefactos optimizados en `dist/web/browser` con hashes criptográficos inmutables.

### Despliegue Automatizado a AWS (S3 + CloudFront)
```powershell
.\deploy-web-s3.ps1 -Action All -Profile idat-cli -Region us-east-2
```
Este script:
1. Compila el bundle de producción con Angular.
2. Sincroniza los chunks hacia el bucket privado de S3 con `Cache-Control: max-age=31536000,public,immutable`.
3. Sube `index.html` con `Cache-Control: max-age=0,no-cache,no-store,must-revalidate`.
4. Invalida globalmente la caché en Amazon CloudFront CDN (`/*`).

---

## 👥 Credenciales de Prueba y Demostración

| Rol | Correo Electrónico | Contraseña | Permisos Clave |
|---|---|---|---|
| **Administrador** | `admin@tunegocio.pe` | `Password123!` | Acceso total: gestión de usuarios, departamentos, RBAC y auditoría forense. |
| **Ingeniero TI / DevOps** | `aldair.cahuana@tunegocio.pe` | `Password123!` | Gestión de tickets, operaciones, SLA e infraestructura cloud. |
| **Agente de Soporte L2** | `henry.monroy@tunegocio.pe` | `Password123!` | Atención de incidentes, clientes SaaS y comentarios. |

---

## 🏛️ Información Académica

* **Institución:** Instituto de Educación Superior IDAT
* **Carrera:** Desarrollo de Sistemas de Información
* **Ciclo:** VI Ciclo — Proyecto Integrador de Titulación
* **Repositorio:** [webpage_PlatformOps-ProductFeedbackHub](https://github.com/Eduardo25042103/webpage_PlatformOps-ProductFeedbackHub)
* **Desarrollador / Autor:** Eduardo S. V. (`sv45340722@idat.pe`)
