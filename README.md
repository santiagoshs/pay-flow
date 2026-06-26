# PayFlow - Gestión de Métodos de Pago

Este proyecto es una aplicación frontend desarrollada para la gestión interactiva de métodos de pago.

## Stack Tecnológico
- **Vue 3** (Composition API con script setup)
- **Quasar Framework v2** (Vite 3)
- **Pinia** (Manejo de estado)
- **TypeScript** (Tipado estricto)
- **Sass/SCSS** (Estilos)

---

## Requisitos Previos
- **Node.js**: v22.22.0 o superior (recomendado para compatibilidad con la versión actual de `@quasar/app-vite`)
- **NPM**: v10 o superior

---

## Instalación y Configuración

1. Clonar el repositorio.
2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

---

## Comandos Disponibles

### Desarrollo
Para levantar el servidor de desarrollo local con recarga en caliente (Hot Module Replacement):
```bash
npm run dev
```
La aplicación estará disponible por defecto en: [http://localhost:9000](http://localhost:9000)

### Compilación para Producción
Para generar el bundle optimizado listo para producción:
```bash
npm run build
```

### Verificación de Tipos
Para verificar que el tipado estricto de TypeScript compila correctamente sin errores:
```bash
npm run typecheck
```

### Linter y Formateo
Para formatear el código y verificar reglas de estilo (ESLint + Prettier):
```bash
npm run lint
```
