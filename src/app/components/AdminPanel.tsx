import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Image,
  Lock,
  LogOut,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  Save,
  Send,
  Trash2,
  Upload,
  User,
  Video,
  X,
} from 'lucide-react';
import {
  clientsService,
  productsService,
  mediaService,
  messagesService,
  adminsService,
  uploadFileToStorage,
  type Client,
  type Product,
  type ProductMedia,
  type Message,
} from '../../services/supabase';

const ADMINS_KEY = 'barsuarte_admins';
const PRODUCTS_KEY = 'barsuarte_products';
const LEGACY_MEDIA_KEY = 'barsuarte_media';
const SESSION_KEY = 'barsuarte_admin_session';
const MESSAGES_KEY = 'barsuarte_messages';
const CLIENTS_KEY = 'barsuarte_clients';

type ProductCategory =
  | 'porta-llaves'
  | 'imanes'
  | 'porta-celulares'
  | 'cuadros-decorativos'
  | 'mini-cuadros'
  | 'entre-vientos';

export interface MediaItem {
  id: string;
  productId: string;
  productTitle: string;
  description: string;
  category: ProductCategory;
  price: string;
  type: 'image' | 'video';
  dataUrl: string;
  name: string;
  caption: string;
  uploadedAt: string;
}

export interface ProductMediaItem {
  id: string;
  productId: string;
  type: 'image' | 'video';
  dataUrl: string;
  name: string;
  uploadedAt: string;
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  price: string;
  media: ProductMediaItem[];
  createdAt: string;
  updatedAt: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthChange: (authenticated: boolean) => void;
}

const DEFAULT_PRODUCT_FORM = {
  title: '',
  description: '',
  category: 'porta-llaves' as ProductCategory,
  price: '',
};

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function toCategory(value: unknown): ProductCategory {
  const categories: ProductCategory[] = [
    'porta-llaves',
    'imanes',
    'porta-celulares',
    'cuadros-decorativos',
    'mini-cuadros',
    'entre-vientos',
  ];

  return categories.includes(value as ProductCategory) ? (value as ProductCategory) : 'porta-llaves';
}

function normalizeProduct(entry: any): ProductItem | null {
  if (!entry) return null;

  if (Array.isArray(entry.media)) {
    return {
      id: entry.id || `${Date.now()}`,
      title: entry.title || entry.productTitle || entry.caption || 'Producto',
      description: entry.description || entry.caption || '',
      category: toCategory(entry.category),
      price: entry.price || '',
      media: entry.media
        .filter(Boolean)
        .map((mediaItem: ProductMediaItem) => ({
          id: mediaItem.id || `${Date.now()}`,
          productId: mediaItem.productId || entry.id || `${Date.now()}`,
          type: mediaItem.type === 'video' ? 'video' : 'image',
          dataUrl: mediaItem.dataUrl,
          name: mediaItem.name || 'archivo',
          uploadedAt: mediaItem.uploadedAt || new Date().toISOString(),
        })),
      createdAt: entry.createdAt || new Date().toISOString(),
      updatedAt: entry.updatedAt || new Date().toISOString(),
    };
  }

  if (entry.dataUrl) {
    const uploadedAt = entry.uploadedAt || new Date().toISOString();
    return {
      id: entry.productId || entry.id || `${Date.now()}`,
      title: entry.productTitle || entry.caption || entry.name || 'Producto',
      description: entry.description || entry.caption || '',
      category: toCategory(entry.category),
      price: entry.price || '',
      media: [
        {
          id: entry.id || `${Date.now()}`,
          productId: entry.productId || entry.id || `${Date.now()}`,
          type: entry.type === 'video' ? 'video' : 'image',
          dataUrl: entry.dataUrl,
          name: entry.name || 'archivo',
          uploadedAt,
        },
      ],
      createdAt: uploadedAt,
      updatedAt: uploadedAt,
    };
  }

  return null;
}

function flattenProducts(products: ProductItem[]): MediaItem[] {
  return products.flatMap((product) =>
    product.media.map((mediaItem) => ({
      id: mediaItem.id,
      productId: product.id,
      productTitle: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      type: mediaItem.type,
      dataUrl: mediaItem.dataUrl,
      name: mediaItem.name,
      caption: product.description || product.title,
      uploadedAt: mediaItem.uploadedAt,
    }))
  );
}

export function loadProducts(): ProductItem[] {
  const products = safeParse<any[]>(localStorage.getItem(PRODUCTS_KEY), []);
  if (products.length > 0) {
    const normalized = products.map(normalizeProduct).filter(Boolean) as ProductItem[];
    if (normalized.length !== products.length) {
      saveProducts(normalized);
    }
    return normalized;
  }

  const legacyMedia = safeParse<any[]>(localStorage.getItem(LEGACY_MEDIA_KEY), []);
  if (legacyMedia.length > 0) {
    const migrated = legacyMedia.map(normalizeProduct).filter(Boolean) as ProductItem[];
    saveProducts(migrated);
    return migrated;
  }

  return [];
}

export function loadMedia(): MediaItem[] {
  return flattenProducts(loadProducts());
}

export function groupMediaByProduct(items: MediaItem[]): ProductItem[] {
  const grouped = new Map<string, ProductItem>();

  items.forEach((item) => {
    const existing = grouped.get(item.productId);
    if (existing) {
      existing.media.push({
        id: item.id,
        productId: item.productId,
        type: item.type,
        dataUrl: item.dataUrl,
        name: item.name,
        uploadedAt: item.uploadedAt,
      });
      existing.updatedAt = item.uploadedAt;
      return;
    }

    grouped.set(item.productId, {
      id: item.productId,
      title: item.productTitle,
      description: item.description,
      category: item.category,
      price: item.price,
      media: [
        {
          id: item.id,
          productId: item.productId,
          type: item.type,
          dataUrl: item.dataUrl,
          name: item.name,
          uploadedAt: item.uploadedAt,
        },
      ],
      createdAt: item.uploadedAt,
      updatedAt: item.uploadedAt,
    });
  });

  return Array.from(grouped.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function saveProducts(items: ProductItem[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(items));
  localStorage.setItem(LEGACY_MEDIA_KEY, JSON.stringify(flattenProducts(items)));
}

export function isAdminSession(): boolean {
  return Boolean(localStorage.getItem(SESSION_KEY));
}

export function AdminPanel({ isOpen, onClose, onAuthChange }: AdminPanelProps) {
  const [authenticated, setAuthenticated] = useState(isAdminSession);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useState<ProductItem[]>(loadProducts);
  const [messages, setMessages] = useState<Message[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'messages' | 'users'>('products');
  const [productForm, setProductForm] = useState(DEFAULT_PRODUCT_FORM);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientSurname, setNewClientSurname] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');
  const [adminRegName, setAdminRegName] = useState('');
  const [adminRegSurname, setAdminRegSurname] = useState('');
  const [adminRegEmail, setAdminRegEmail] = useState('');
  const [adminRegPhone, setAdminRegPhone] = useState('');
  const [adminRegPassword, setAdminRegPassword] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onAuthChange(authenticated);
  }, [authenticated, onAuthChange]);

  useEffect(() => {
    if (!authenticated) return;

    const refresh = async () => {
      try {
        const [supabaseProducts, supabaseMessages, supabaseClients] = await Promise.all([
          productsService.getAllWithMedia(),
          messagesService.getAll(),
          clientsService.getAll(),
        ]);

        setProducts(supabaseProducts as ProductItem[]);
        setMessages(supabaseMessages);
        setClients(supabaseClients);
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    };

    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [authenticated]);

  const groupedProducts = useMemo(() => products, [products]);
  const pendingMessages = messages.filter((message) => message.status === 'pending').length;

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = () => {
    (async () => {
      if (!loginEmail || !loginPassword) {
        setLoginError('Correo y contraseña son requeridos');
        return;
      }

          const client = await clientsService.getByEmail(loginEmail);
          if (!client || client.password !== loginPassword) {
            setLoginError('Correo o contraseña incorrectos');
            return;
          }

          const admin = await adminsService.getByEmail(loginEmail);
          if (!admin) {
            setLoginError('Este usuario no está autorizado como administrador');
            return;
          }

          setAuthenticated(true);
          localStorage.setItem(SESSION_KEY, loginEmail);
          setLoginError('');
          setLoginEmail('');
          setLoginPassword('');
      } catch (err) {
        console.error('Error during admin login:', err);
        setLoginError('Error de autenticación');
      }
    })();
  };

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem(SESSION_KEY);
    onClose();
  };

  const handleRegisterAdmin = async () => {
    if (!adminRegName || !adminRegSurname || !adminRegEmail || !adminRegPhone || !adminRegPassword) {
      showToast('Completa todos los campos para registrar administrador', 'err');
      return;
    }

    const exists = clients.some((client) => client.email === adminRegEmail) || (await clientsService.getByEmail(adminRegEmail) !== null);
    if (exists) {
      showToast('El correo ya está registrado', 'err');
      return;
    }

    const createdClient = await clientsService.create({
      name: adminRegName,
      surname: adminRegSurname,
      email: adminRegEmail,
      phone: adminRegPhone,
      password: adminRegPassword,
    });

    if (!createdClient) {
      showToast('No se pudo crear el administrador', 'err');
      return;
    }

    // create admin row in DB linked to the client
    const createdAdmin = await adminsService.create(createdClient.id, createdClient.email);
    if (!createdAdmin) {
      showToast('No se pudo crear el registro de administrador en la base de datos', 'err');
      return;
    }

    setAuthenticated(true);
    localStorage.setItem(SESSION_KEY, adminRegEmail);
    showToast('Administrador registrado e ingresado correctamente');

    // reset
    setAdminRegName('');
    setAdminRegSurname('');
    setAdminRegEmail('');
    setAdminRegPhone('');
    setAdminRegPassword('');
    setShowRegister(false);
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(DEFAULT_PRODUCT_FORM);
    setSelectedFiles([]);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleFilesPicked = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('No se pudo leer el archivo'));
        }
      };
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsDataURL(file);
    });

  const createMediaItems = async (files: File[], productId: string) => {
    const failedUploads: string[] = [];
    const items = await Promise.all(
      files.map(async (file) => {
        let storageUrl: string | null = null;
        try {
          storageUrl = await uploadFileToStorage(file);
        } catch (err) {
          console.error('Error during uploadFileToStorage:', err);
          storageUrl = null;
        }

        const dataUrl = storageUrl ?? (await readFileAsDataUrl(file));

        if (!storageUrl) failedUploads.push(file.name);

        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          productId,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          dataUrl,
          name: file.name,
          uploadedAt: new Date().toISOString(),
        };
      })
    );

    if (failedUploads.length > 0) {
      showToast(`No se pudieron subir ${failedUploads.length} archivo(s) al bucket: ${failedUploads.join(', ')}`, 'err');
      console.warn('Failed uploads:', failedUploads);
    }

    return items;
  };

  const refreshData = async () => {
    try {
      const [supabaseProducts, supabaseMessages, supabaseClients] = await Promise.all([
        productsService.getAllWithMedia(),
        messagesService.getAll(),
        clientsService.getAll(),
      ]);

      setProducts(supabaseProducts as ProductItem[]);
      setMessages(supabaseMessages);
      setClients(supabaseClients);
    } catch (error) {
      console.error('Error cargando datos del panel:', error);
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.title.trim()) {
      showToast('Escribe el nombre del producto', 'err');
      return;
    }

    if (!editingProductId && selectedFiles.length === 0) {
      showToast('Sube al menos una foto o video', 'err');
      return;
    }

    setUploading(true);

    const newMedia = selectedFiles.length > 0
      ? await createMediaItems(selectedFiles, '')
      : [];

    try {
      if (editingProductId) {
        const updatedProduct = await productsService.update(editingProductId, {
          title: productForm.title,
          description: productForm.description,
          category: productForm.category,
          price: productForm.price,
        });

        if (!updatedProduct) {
          showToast('No se pudo actualizar el producto', 'err');
          return;
        }

        for (const mediaItem of newMedia) {
          await mediaService.addMedia(updatedProduct.id, {
            type: mediaItem.type,
            dataUrl: mediaItem.dataUrl,
            name: mediaItem.name,
            uploadedAt: mediaItem.uploadedAt,
          });
        }

        showToast('Producto actualizado correctamente');
      } else {
        const created = await productsService.createWithMedia(
          {
            title: productForm.title,
            description: productForm.description,
            category: productForm.category,
            price: productForm.price,
          },
          newMedia.map((item) => ({
            type: item.type,
            dataUrl: item.dataUrl,
            name: item.name,
            uploadedAt: item.uploadedAt,
          }))
        );

        if (!created) {
          showToast('No se pudo crear el producto', 'err');
          return;
        }

        showToast('Producto creado correctamente');
      }

      await refreshData();
      resetProductForm();
    } finally {
      setUploading(false);
    }
  };

  const handleEditProduct = (product: ProductItem) => {
    setEditingProductId(product.id);
    setProductForm({
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
    });
    setSelectedFiles([]);
    setActiveTab('products');
  };

  const handleDeleteProduct = async (id: string) => {
    const deleted = await productsService.delete(id);
    if (!deleted) {
      showToast('No se pudo eliminar el producto', 'err');
      return;
    }

    if (editingProductId === id) {
      resetProductForm();
    }

    await refreshData();
    showToast('Producto eliminado', 'err');
  };

  const handleCreateClient = async () => {
    if (!newClientName || !newClientSurname || !newClientEmail || !newClientPhone || !newClientPassword) {
      showToast('Completa todos los campos', 'err');
      return;
    }

    const exists = clients.some((client) => client.email === newClientEmail);
    if (exists) {
      showToast('El correo ya está registrado', 'err');
      return;
    }

    const createdClient = await clientsService.create({
      name: newClientName,
      surname: newClientSurname,
      email: newClientEmail,
      phone: newClientPhone,
      password: newClientPassword,
    });

    if (!createdClient) {
      showToast('No se pudo crear el cliente', 'err');
      return;
    }

    setClients((prev) => [...prev, createdClient]);
    setNewClientName('');
    setNewClientSurname('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientPassword('');
    showToast('Cliente creado correctamente');
  };

  const handleDeleteClient = async (id: string) => {
    const deleted = await clientsService.delete(id);
    if (!deleted) {
      showToast('No se pudo eliminar el cliente', 'err');
      return;
    }

    setClients((prev) => prev.filter((client) => client.id !== id));
    showToast('Cliente eliminado', 'err');
  };

  const handleRespond = async (messageId: string) => {
    const response = responses[messageId];
    if (!response || !response.trim()) {
      showToast('Escribe una respuesta primero', 'err');
      return;
    }

    const updated = await messagesService.respond(messageId, response);
    if (!updated) {
      showToast('No se pudo responder el mensaje', 'err');
      return;
    }

    setResponses((prev) => ({ ...prev, [messageId]: '' }));
    await refreshData();
    showToast('Respuesta enviada al cliente');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-fuchsia-600 to-purple-600 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-white">
                <Lock className="w-5 h-5" />
                <h2 className="font-bold text-lg">Panel de Administración</h2>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mx-6 mt-4 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium ${
                    toast.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {toast.type === 'ok' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {toast.msg}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-6">
              {!authenticated ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto mt-8">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center shadow-lg shadow-fuchsia-200">
                      <Lock className="w-9 h-9 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h3>
                    <p className="text-gray-500 text-sm">Solo el administrador puede gestionar productos, usuarios y mensajes.</p>
                  </div>

                  <div className="space-y-4">
                    {!showRegister ? (
                      <>
                        <input
                          type="email"
                          placeholder="Correo electrónico"
                          value={loginEmail}
                          onChange={(e) => { setLoginEmail(e.target.value); setLoginError(''); }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-fuchsia-400 focus:outline-none transition-colors"
                        />
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Contraseña"
                            value={loginPassword}
                            onChange={(event) => { setLoginPassword(event.target.value); setLoginError(''); }}
                            onKeyDown={(event) => event.key === 'Enter' && handleLogin()}
                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-fuchsia-400 focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>

                        {loginError && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> {loginError}
                          </p>
                        )}

                        <button
                          onClick={handleLogin}
                          className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg shadow-fuchsia-200"
                        >
                          Ingresar
                        </button>

                        <div className="text-center text-sm text-gray-500 mt-2">
                          ¿No tienes una cuenta de administrador?{' '}
                          <button onClick={() => setShowRegister(true)} className="text-fuchsia-600 underline">Regístrate</button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <input value={adminRegName} onChange={(e) => setAdminRegName(e.target.value)} placeholder="Nombre" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
                        <input value={adminRegSurname} onChange={(e) => setAdminRegSurname(e.target.value)} placeholder="Apellido" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
                        <input value={adminRegEmail} onChange={(e) => setAdminRegEmail(e.target.value)} placeholder="Correo electrónico" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
                        <input value={adminRegPhone} onChange={(e) => setAdminRegPhone(e.target.value)} placeholder="Teléfono" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
                        <input value={adminRegPassword} onChange={(e) => setAdminRegPassword(e.target.value)} placeholder="Contraseña" type={showPassword ? 'text' : 'password'} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />

                        <div className="flex gap-2">
                          <button onClick={handleRegisterAdmin} className="flex-1 py-3 bg-green-600 text-white rounded-xl">Registrar admin</button>
                          <button onClick={() => setShowRegister(false)} className="px-4 py-3 border rounded-xl">Cancelar</button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Sesión activa</p>
                      <p className="font-bold text-fuchsia-700">Administrador Barsuarte</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </button>
                  </div>

                  <div className="flex gap-2 border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('products')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'products'
                          ? 'border-fuchsia-600 text-fuchsia-600'
                          : 'border-transparent text-gray-600 hover:text-fuchsia-600'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      Productos
                    </button>
                    <button
                      onClick={() => setActiveTab('messages')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                        activeTab === 'messages'
                          ? 'border-fuchsia-600 text-fuchsia-600'
                          : 'border-transparent text-gray-600 hover:text-fuchsia-600'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Mensajes
                      {pendingMessages > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {pendingMessages}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'users'
                          ? 'border-fuchsia-600 text-fuchsia-600'
                          : 'border-transparent text-gray-600 hover:text-fuchsia-600'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Usuarios
                    </button>
                  </div>

                  {activeTab === 'products' && (
                    <div className="space-y-6">
                      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                              {editingProductId ? <Pencil className="w-5 h-5 text-fuchsia-600" /> : <Plus className="w-5 h-5 text-fuchsia-600" />}
                              {editingProductId ? 'Editar producto' : 'Nuevo producto'}
                            </h3>
                            <p className="text-sm text-gray-500">Agrega una o varias fotos y videos para cada producto.</p>
                          </div>
                          {editingProductId && (
                            <button
                              onClick={resetProductForm}
                              className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                              Cancelar edición
                            </button>
                          )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            value={productForm.title}
                            onChange={(event) => setProductForm((prev) => ({ ...prev, title: event.target.value }))}
                            placeholder="Nombre del producto"
                            className="px-3 py-2 border rounded-lg"
                          />
                          <select
                            value={productForm.category}
                            onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value as ProductCategory }))}
                            className="px-3 py-2 border rounded-lg bg-white"
                          >
                            <option value="porta-llaves">Porta llaves</option>
                            <option value="imanes">Imanes</option>
                            <option value="porta-celulares">Porta celulares</option>
                            <option value="cuadros-decorativos">Cuadros decorativos</option>
                            <option value="mini-cuadros">Mini cuadros</option>
                            <option value="entre-vientos">Entre vientos</option>
                          </select>
                        </div>

                        <input
                          value={productForm.price}
                          onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
                          placeholder="Precio"
                          className="w-full px-3 py-2 border rounded-lg"
                        />

                        <textarea
                          value={productForm.description}
                          onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
                          placeholder="Descripción del producto"
                          rows={4}
                          className="w-full px-3 py-2 border rounded-lg resize-none"
                        />

                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          className="hidden"
                          onChange={(event) => handleFilesPicked(event.target.files)}
                        />

                        <button
                          onClick={() => imageInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full py-4 border-2 border-dashed border-fuchsia-300 rounded-xl text-fuchsia-600 hover:border-fuchsia-500 hover:bg-fuchsia-50 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                          <Upload className="w-5 h-5" />
                          {uploading ? 'Procesando...' : 'Agregar fotos o videos'}
                        </button>

                        {selectedFiles.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedFiles.map((file, index) => (
                              <span key={`${file.name}-${index}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
                                {file.type.startsWith('video/') ? <Video className="w-4 h-4" /> : <Image className="w-4 h-4" />}
                                {file.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleSaveProduct}
                            disabled={uploading}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-fuchsia-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            {editingProductId ? 'Actualizar producto' : 'Guardar producto'}
                          </button>
                          <button onClick={resetProductForm} className="px-4 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
                            Limpiar
                          </button>
                        </div>
                      </section>

                      <section className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800">Productos guardados ({groupedProducts.length})</h3>
                          <p className="text-xs text-gray-400">Cada producto puede tener varias fotos o videos.</p>
                        </div>

                        {groupedProducts.length === 0 ? (
                          <div className="border-2 border-dashed border-fuchsia-200 rounded-2xl p-10 text-center bg-gradient-to-br from-fuchsia-50 to-purple-50">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center">
                              <Package className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-gray-600 mb-2">Todavía no hay productos cargados.</p>
                            <p className="text-sm text-gray-400">Crea el primero usando el formulario superior.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {groupedProducts.map((product) => {
                              const cover = product.media[0];
                              return (
                                <div key={product.id} className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                                  <div className="grid md:grid-cols-[160px_1fr] gap-4 p-4">
                                    <div className="rounded-xl overflow-hidden bg-gray-100 h-40 md:h-full min-h-[160px]">
                                      {cover ? (
                                        cover.type === 'video' ? (
                                          <video src={cover.dataUrl} className="w-full h-full object-cover bg-black" />
                                        ) : (
                                          <img src={cover.dataUrl} alt={product.title} className="w-full h-full object-cover" />
                                        )
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">Sin archivos</div>
                                      )}
                                    </div>

                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <h4 className="font-bold text-gray-800 text-lg">{product.title}</h4>
                                          <p className="text-sm text-gray-500">{product.description || 'Sin descripción'}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-fuchsia-600 font-bold">{product.price || 'Sin precio'}</p>
                                          <p className="text-xs text-gray-400">{product.media.length} archivo(s)</p>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">{product.category}</span>
                                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Creado: {new Date(product.createdAt).toLocaleDateString('es-CO')}</span>
                                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Actualizado: {new Date(product.updatedAt).toLocaleDateString('es-CO')}</span>
                                      </div>

                                      <div className="flex flex-wrap gap-2">
                                        {product.media.map((item) => (
                                          <span key={item.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 text-xs text-gray-600 border border-gray-100">
                                            {item.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <Image className="w-3.5 h-3.5" />}
                                            {item.name}
                                          </span>
                                        ))}
                                      </div>

                                      <div className="flex gap-2 pt-1">
                                        <button
                                          onClick={() => handleEditProduct(product)}
                                          className="px-3 py-2 rounded-lg border border-fuchsia-200 text-fuchsia-700 hover:bg-fuchsia-50 text-sm font-medium"
                                        >
                                          Editar
                                        </button>
                                        <button
                                          onClick={() => handleDeleteProduct(product.id)}
                                          className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium"
                                        >
                                          Eliminar
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </section>

                      <p className="text-xs text-gray-400 text-center pb-4">
                        Los archivos y datos se guardan localmente en este dispositivo. Contraseña: <span className="bg-gray-100 px-1 rounded">barsuarte2024</span>
                      </p>
                    </div>
                  )}

                  {activeTab === 'messages' && (
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-fuchsia-400" />
                          </div>
                          <p className="text-gray-500">No hay mensajes de clientes</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`border-2 rounded-xl p-4 ${
                                message.status === 'answered' ? 'border-green-200 bg-green-50' : 'border-fuchsia-200 bg-fuchsia-50'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{message.clientName}</h4>
                                    <p className="text-xs text-gray-500">
                                      {new Date(message.createdAt).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    message.status === 'answered' ? 'bg-green-200 text-green-700' : 'bg-yellow-200 text-yellow-700'
                                  }`}
                                >
                                  {message.status === 'answered' ? 'Respondido' : 'Nuevo'}
                                </span>
                              </div>

                              <h3 className="font-bold text-gray-800 mb-1">{message.subject}</h3>
                              <p className="text-sm text-gray-700 mb-3">{message.message}</p>

                              {message.status === 'answered' && message.adminResponse ? (
                                <div className="mt-3 pt-3 border-t border-green-300">
                                  <p className="text-xs font-medium text-gray-600 mb-1">Tu respuesta:</p>
                                  <p className="text-sm text-gray-700 bg-white rounded-lg p-2">{message.adminResponse}</p>
                                </div>
                              ) : (
                                <div className="mt-3 pt-3 border-t border-fuchsia-300">
                                  <textarea
                                    value={responses[message.id] || ''}
                                    onChange={(event) => setResponses((prev) => ({ ...prev, [message.id]: event.target.value }))}
                                    placeholder="Escribe tu respuesta al cliente..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none resize-none mb-2"
                                  />
                                  <button
                                    onClick={() => handleRespond(message.id)}
                                    className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-fuchsia-300 transition-all flex items-center justify-center gap-2"
                                  >
                                    <Send className="w-4 h-4" />
                                    Enviar Respuesta
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'users' && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-2">Crear Cliente</h3>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <input value={newClientName} onChange={(event) => setNewClientName(event.target.value)} placeholder="Nombre" className="px-3 py-2 border rounded-lg" />
                          <input value={newClientSurname} onChange={(event) => setNewClientSurname(event.target.value)} placeholder="Apellido" className="px-3 py-2 border rounded-lg" />
                          <input value={newClientEmail} onChange={(event) => setNewClientEmail(event.target.value)} placeholder="Correo electrónico" className="px-3 py-2 border rounded-lg" />
                          <input value={newClientPhone} onChange={(event) => setNewClientPhone(event.target.value)} placeholder="Teléfono celular" className="px-3 py-2 border rounded-lg" />
                          <input value={newClientPassword} onChange={(event) => setNewClientPassword(event.target.value)} placeholder="Contraseña" className="px-3 py-2 border rounded-lg md:col-span-2" />
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button onClick={handleCreateClient} className="px-4 py-2 bg-fuchsia-600 text-white rounded-lg">Crear</button>
                          <button
                            onClick={() => {
                              setNewClientName('');
                              setNewClientSurname('');
                              setNewClientEmail('');
                              setNewClientPhone('');
                              setNewClientPassword('');
                            }}
                            className="px-4 py-2 border rounded-lg"
                          >
                            Limpiar
                          </button>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-3">Clientes registrados ({clients.length})</h3>
                        {clients.length === 0 ? (
                          <p className="text-sm text-gray-500">No hay clientes registrados</p>
                        ) : (
                          <div className="space-y-2">
                            {clients.map((client) => (
                              <div key={client.id} className="flex items-start justify-between gap-3 border rounded p-2">
                                <div>
                                  <div className="font-medium">
                                    {client.name} {client.surname}
                                  </div>
                                  <div className="text-xs text-gray-500">{client.email}</div>
                                  <div className="text-xs text-gray-500">{client.phone}</div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="text-xs text-gray-400">{new Date(client.createdAt).toLocaleDateString()}</div>
                                  <button onClick={() => handleDeleteClient(client.id)} className="text-red-500 px-3 py-1 rounded bg-red-50">Eliminar</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}