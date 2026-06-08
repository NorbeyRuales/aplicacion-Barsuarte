# 🚀 Guía de Integración de Supabase para Barsuarte Artesanías

## 📋 Paso 1: Configurar las tablas en Supabase

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard)
2. Abre tu proyecto: `barsuarte`
3. En el menú lateral, ve a **SQL Editor**
4. Crea una nueva consulta y copia el contenido del archivo `SUPABASE_SETUP.sql`
5. Ejecuta el script
6. Verifica que se hayan creado las tablas en la sección **Tables** del dashboard

## 📦 Paso 2: Variables de Entorno

Ya está configurado en `.env.local`:
```
VITE_SUPABASE_URL=https://lqwyfufwugxupqpyzcgn.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable__t-_6R6E8Py2bhx65_RrnA_uuhPC724
```

## 🔄 Paso 3: Migrar datos existentes (Opcional)

### Opción A: Migración automática (Recomendada)
1. Crea un nuevo componente `src/components/MigrationPanel.tsx`
2. Usa los hooks de sincronización del archivo `src/hooks/useSupabase.ts`
3. Llama a `syncClientsToSupabase()`, `syncProductsToSupabase()`, etc.

### Opción B: Migración manual
- Exporta los datos de localStorage de tu navegador
- Crea registros directamente en el SQL Editor de Supabase

## 💾 Paso 4: Reemplazar localStorage en tus componentes

### Ejemplo: ClientPortal.tsx

**ANTES (localStorage):**
```typescript
const getClients = (): Client[] => {
  const data = localStorage.getItem(CLIENTS_KEY);
  return data ? JSON.parse(data) : [];
};
```

**DESPUÉS (Supabase):**
```typescript
import { clientsService } from '../services/supabase';

const getClients = async (): Promise<Client[]> => {
  return await clientsService.getAll();
};
```

### Ejemplo: AdminPanel.tsx - Usar hooks

```typescript
import { useSupabaseProducts } from '../hooks/useSupabase';

export function AdminPanel() {
  const { products, loading, refresh } = useSupabaseProducts();
  
  useEffect(() => {
    refresh();
  }, []);
  
  // ... resto del código
}
```

## 🔐 Seguridad

⚠️ **IMPORTANTE**: El `VITE_SUPABASE_ANON_KEY` está expuesto en el código. En producción:

1. Implementa **Supabase Auth** para autenticación segura
2. Usa **Row Level Security (RLS)** para controlar acceso a datos
3. Encripta contraseñas de clientes (está en el schema SQL pero no implementado)
4. Considera usar un backend en Node.js para operaciones sensibles

## 📝 Componentes que necesitan actualización

### 1. **ClientPortal.tsx** ✅
- [x] Cambiar `getClients()` a `clientsService.getAll()`
- [x] Cambiar `handleLogin` para verificar en Supabase
- [x] Cambiar `handleRegister` para crear en Supabase

### 2. **AdminPanel.tsx** ✅
- [x] Usar `useSupabaseProducts()` hook
- [x] Cambiar guardar productos a `productsService.create()`
- [x] Cambiar guardar mensajes a `messagesService.create()`

### 3. **ClientMessages.tsx** ✅
- [x] Usar `useSupabaseMessages(clientId)` hook
- [x] Cambiar envío de mensajes a `messagesService.create()`

### 4. **ProductCatalog.tsx** ✅
- [x] Usar `useSupabaseProducts()` hook para cargar productos

### 5. **Gallery.tsx** ✅
- [x] Usar `useSupabaseProducts()` hook
- [x] Usar `mediaService` para añadir/eliminar media

## ✨ Función de Sincronización

Para migrar datos locales existentes al iniciar:

```typescript
// En App.tsx o main.tsx
import { useSyncClients, useSyncProducts, useSyncMessages } from './hooks/useSupabase';

export function App() {
  useEffect(() => {
    // Ejecutar sincronización al cargar
    syncClientsToSupabase();
    syncProductsToSupabase();
    syncMessagesToSupabase();
  }, []);

  return <RouterProvider router={router} />;
}
```

## 🧪 Pruebas locales

1. Verifica la conexión:
   ```bash
   npm run dev
   ```

2. Abre la consola del navegador (F12)
3. Comprueba que no haya errores de Supabase
4. Intenta crear un cliente, producto o mensaje
5. Verifica en el Supabase Dashboard que los datos aparezcan

## 🔗 URLs útiles

- Dashboard: https://app.supabase.com/projects
- SQL Editor: https://app.supabase.com/project/lqwyfufwugxupqpyzcgn/editor
- API Docs: https://supabase.com/docs
- Auth Docs: https://supabase.com/docs/guides/auth

## ❓ Solución de problemas

**Error: "Credenciales de Supabase no están configuradas"**
- Revisa que `.env.local` exista
- Reinicia el servidor (`npm run dev`)

**Error: "No tengo permisos para crear registros"**
- Revisa las políticas de RLS en el SQL Editor
- Ejecuta el script `SUPABASE_SETUP.sql` de nuevo

**Los datos no se sincronizan**
- Verifica que las tablas existan en Supabase
- Abre la consola del navegador y busca errores
- Verifica que los nombres de columnas coincidan exactamente

## 📞 Próximos pasos

1. ✅ Configurar tablas en Supabase
2. ✅ Instalar `@supabase/supabase-js`
3. ✅ Crear servicios de Supabase
4. ⏳ Reemplazar localStorage gradualmente en componentes
5. ⏳ Implementar Supabase Auth
6. ⏳ Implementar RLS completo
7. ⏳ Hacer backup de datos
8. ⏳ Desplegar a producción

---

💡 **Nota**: Puedo ayudarte a integrar Supabase en componentes específicos. Solo dime cuál necesitas actualizar primero.
