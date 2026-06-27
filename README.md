# PayFlow - Portal de Gestión de Métodos de Pago

Este proyecto es una aplicación frontend desarrollada con Vue 3, Pinia y Quasar Framework, diseñada bajo estándares de producción reales para gestionar métodos de pago con persistencia local y simulación de API.

## Arquitectura y Decisiones de Diseño

Para emular una arquitectura real cliente-servidor sin implementar un backend físico, se diseñaron las siguientes capas desacopladas:

1. **Capa de Persistencia (IndexedDB)**:
   - Implementada nativamente en [db.ts](file:///Users/santiagoshs/Code/pay-flow/src/services/db.ts) para evitar la instalación de librerías externas de terceros (respetando la restricción del proyecto).
   - Crea y maneja la base de datos `payflow_db`, inicializando credenciales por defecto (`admin` / `admin123`) y 5 métodos de pago de semilla.
   
2. **Capa de Simulación de Red (Axios + Custom Adapter)**:
   - Configurada en [axios.ts](file:///Users/santiagoshs/Code/pay-flow/src/boot/axios.ts).
   - Intercepta las llamadas del cliente Axios `/api/*` y las resuelve consultando/escribiendo en IndexedDB.
   - Introduce una latencia de red aleatoria de 400ms a 800ms para asegurar el testeo correcto de los loaders y skeletons de Quasar en la UI.

3. **Capa de Estado Global (Pinia Stores)**:
   - Centraliza el estado de los métodos de pago ([payments.ts](file:///Users/santiagoshs/Code/pay-flow/src/stores/payments.ts)) y sesión ([auth.ts](file:///Users/santiagoshs/Code/pay-flow/src/stores/auth.ts)).
   - Gestiona errores asíncronos y expone estados reactivos de carga (`loading`) y error global.

4. **Componentes y Vistas**:
   - Totalmente desacoplados y modulares (manteniendo cada archivo estrictamente por debajo de las 200 líneas).
   - Diálogos y filtros genéricos comunicados mediante contratos estrictos de TypeScript (`Props` y `Emits`).
   - Validación integrada mediante los campos nativos `:rules` de Quasar, sin necesidad de dependencias de validación externas.

---

## Credenciales de Prueba

Al iniciar la aplicación por primera vez, IndexedDB se autosembrará con la siguiente cuenta:
- **Usuario**: `admin`
- **Contraseña**: `admin123`

*Nota: La aplicación dispone de una sección de registro en la pantalla de inicio de sesión para crear nuevos usuarios reales persistidos en IndexedDB.*

---

## Comandos Disponibles

### Levantar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible por defecto en: [http://localhost:9000](http://localhost:9000)

### Pruebas Unitarias (Vitest)
Para ejecutar la suite de pruebas unitarias de los componentes y los stores:
```bash
npm run test:unit
```

### Verificación de TypeScript
```bash
npm run typecheck
```

### Linter y Estilos (ESLint + Prettier)
```bash
npm run lint:check
```
