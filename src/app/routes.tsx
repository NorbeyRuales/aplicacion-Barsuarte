import { createBrowserRouter } from 'react-router';
import { MainSite } from './pages/MainSite';
import { NosotrosPage } from './pages/NosotrosPage';
import { ProductosPage } from './pages/ProductosPage';
import { CategoryPage } from './pages/CategoryPage';
import { MisionPage } from './pages/MisionPage';
import { TrayectoriaPage } from './pages/TrayectoriaPage';
import { ContactoPage } from './pages/ContactoPage';
import { ClientPortal } from './pages/ClientPortal';
import { ProductCatalog } from './pages/ProductCatalog';
import { ClientMessages } from './pages/ClientMessages';
import { ClientProfile } from './pages/ClientProfile';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: MainSite,
  },
  {
    path: '/nosotros',
    Component: NosotrosPage,
  },
  {
    path: '/productos',
    Component: ProductosPage,
  },
  {
    path: '/productos/:category',
    Component: CategoryPage,
  },
  {
    path: '/mision',
    Component: MisionPage,
  },
  {
    path: '/trayectoria',
    Component: TrayectoriaPage,
  },
  {
    path: '/contacto',
    Component: ContactoPage,
  },
  {
    path: '/clientes',
    Component: ClientPortal,
    children: [
      { index: true, Component: ProductCatalog },
      { path: 'productos', Component: ProductCatalog },
      { path: 'mensajes', Component: ClientMessages },
      { path: 'perfil', Component: ClientProfile },
    ],
  },
  {
    path: '*',
    Component: NotFound,
  },
]);
