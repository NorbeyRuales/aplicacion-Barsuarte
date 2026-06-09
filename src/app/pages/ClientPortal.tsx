import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, ShoppingBag, MessageSquare, LogOut, Home, Eye, EyeOff, Settings, Upload } from 'lucide-react';
import { clientsService, adminsService, type Client } from '../../services/supabase';
import { AdminPanel } from '../components/AdminPanel';

const CURRENT_CLIENT_KEY = 'barsuarte_current_client';
const POST_AUTH_REDIRECT_KEY = 'barsuarte_post_auth_redirect';

const getPostAuthRedirect = () => {
  const redirect = localStorage.getItem(POST_AUTH_REDIRECT_KEY);
  localStorage.removeItem(POST_AUTH_REDIRECT_KEY);
  return redirect || '/clientes/productos';
};

export function ClientPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerSurname, setRegisterSurname] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    const savedClient = localStorage.getItem(CURRENT_CLIENT_KEY);
    if (savedClient) {
      const clientObj = JSON.parse(savedClient) as Client;
      setCurrentClient(clientObj);
      setIsLoggedIn(true);
      adminsService.getByEmail(clientObj.email).then((admin) => {
        setIsAdmin(!!admin);
      });
    }
  }, []);

  useEffect(() => {
    const savedClient = localStorage.getItem(CURRENT_CLIENT_KEY);

    if (!isLoggedIn && !savedClient && location.pathname !== '/clientes') {
      localStorage.setItem(POST_AUTH_REDIRECT_KEY, location.pathname);
      navigate('/clientes', { replace: true });
    }
  }, [isLoggedIn, location.pathname, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const email = loginEmail.trim().toLowerCase();
    const client = await clientsService.getByEmail(email);
    if (!client || client.password !== loginPassword) {
      setError('Correo o contraseña incorrectos');
      return;
    }

    const admin = await adminsService.getByEmail(email);
    setIsAdmin(!!admin);
    if (admin) {
      localStorage.setItem('barsuarte_admin_session', email);
    }

    setCurrentClient(client);
    setIsLoggedIn(true);
    localStorage.setItem(CURRENT_CLIENT_KEY, JSON.stringify(client));
    navigate(getPostAuthRedirect());
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = registerEmail.trim().toLowerCase();

    if (!registerName || !registerSurname || !email || !registerPhone || !registerPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    const existingClient = await clientsService.getByEmail(email);
    if (existingClient) {
      setError('Este correo ya está registrado');
      return;
    }

    const newClient = await clientsService.create({
      name: registerName.trim(),
      surname: registerSurname.trim(),
      email,
      phone: registerPhone.trim(),
      password: registerPassword,
    });

    if (!newClient) {
      setError('No se pudo crear la cuenta. Intenta de nuevo.');
      return;
    }

    setIsAdmin(false);
    setCurrentClient(newClient);
    setIsLoggedIn(true);
    localStorage.setItem(CURRENT_CLIENT_KEY, JSON.stringify(newClient));
    navigate(getPostAuthRedirect());
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentClient(null);
    setIsAdmin(false);
    setAdminOpen(false);
    localStorage.removeItem(CURRENT_CLIENT_KEY);
    localStorage.removeItem('barsuarte_admin_session');
    setLoginEmail('');
    setLoginPassword('');
    setRegisterName('');
    setRegisterSurname('');
    setRegisterEmail('');
    setRegisterPhone('');
    setRegisterPassword('');
    navigate('/clientes');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-purple-50 to-white flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Back to home */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-fuchsia-600 mb-6 transition-colors"
          >
            <Home className="w-4 h-4" />
            Volver al sitio principal
          </button>

          <div className="bg-white rounded-3xl shadow-2xl shadow-fuchsia-200/50 p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-white rounded-full p-3 shadow-md flex items-center justify-center mb-4 border border-fuchsia-100">
                <img
                  src="/Logo_Plumas.png"
                  alt="Logo Barsuarte"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col items-center leading-none">
                <span
                  className="uppercase text-[#163f9b] font-bold"
                  style={{
                    fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
                    fontSize: '2rem',
                    letterSpacing: '0.09em',
                    transform: 'skewX(-3deg)',
                  }}
                >
                  Barsuarte
                </span>
                <span
                  className="text-fuchsia-600 font-medium mt-1"
                  style={{
                    fontFamily: '"Brush Script MT", "Segoe Script", "Snell Roundhand", cursive',
                    fontSize: '1.25rem',
                    letterSpacing: '0.02em',
                    transform: 'skewX(-6deg)',
                  }}
                >
                  Naturalidad y Color
                </span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent mt-4 mb-1">
                Portal de Clientes
              </h1>
            </div>

            {/* Toggle */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setShowLogin(true)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  showLogin
                    ? 'bg-white text-fuchsia-600 shadow-sm'
                    : 'text-gray-600 hover:text-fuchsia-600'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  !showLogin
                    ? 'bg-white text-fuchsia-600 shadow-sm'
                    : 'text-gray-600 hover:text-fuchsia-600'
                }`}
              >
                Registrarse
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm"
              >
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {showLogin ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-fuchsia-300 transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Iniciar Sesión
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={registerSurname}
                      onChange={(e) => setRegisterSurname(e.target.value)}
                      placeholder="Tu apellido"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Teléfono celular
                    </label>
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="300 000 0000"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-fuchsia-300 transition-all flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Crear Cuenta
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-fuchsia-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white border border-gray-200">
              <img
                src="/Logo_Plumas.png"
                alt="Logo Barsuarte"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="uppercase text-[#163f9b] font-bold"
                style={{
                  fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
                  fontSize: '1.25rem',
                  letterSpacing: '0.09em',
                  transform: 'skewX(-3deg)',
                }}
              >
                Barsuarte
              </span>
              <span
                className="text-fuchsia-600 font-medium -mt-0.5"
                style={{
                  fontFamily: '"Brush Script MT", "Segoe Script", "Snell Roundhand", cursive',
                  fontSize: '0.85rem',
                  letterSpacing: '0.02em',
                  transform: 'skewX(-6deg)',
                }}
              >
                Naturalidad y Color
              </span>
              <p className="text-[10px] text-gray-400 mt-1">
                Bienvenido, {currentClient?.name} {currentClient?.surname || ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg transition-all"
            >
              <Home className="w-4 h-4" />
              Inicio
            </button>
            <button
              onClick={() => navigate('/clientes/perfil')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg transition-all"
            >
              <User className="w-4 h-4" />
              Perfil
            </button>
            {isAdmin && (
              <button
                onClick={() => setAdminOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100 rounded-lg transition-all font-medium border border-fuchsia-200 shadow-sm"
              >
                <Settings className="w-4 h-4" />
                Panel Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => navigate('/clientes/productos')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                location.pathname === '/clientes/productos' || location.pathname === '/clientes'
                  ? 'border-fuchsia-600 text-fuchsia-600'
                  : 'border-transparent text-gray-600 hover:text-fuchsia-600'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Catálogo de Productos
            </button>
            <button
              onClick={() => navigate('/clientes/mensajes')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                location.pathname === '/clientes/mensajes'
                  ? 'border-fuchsia-600 text-fuchsia-600'
                  : 'border-transparent text-gray-600 hover:text-fuchsia-600'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Mensajes
            </button>
            <button
              onClick={() => navigate('/clientes/historia')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                location.pathname === '/clientes/historia'
                  ? 'border-fuchsia-600 text-fuchsia-600'
                  : 'border-transparent text-gray-600 hover:text-fuchsia-600'
              }`}
            >
              <Upload className="w-4 h-4" />
              Compartir emprendimiento
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet context={{ client: currentClient, setClient: setCurrentClient, logout: handleLogout }} />
      </main>

      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onAuthChange={setIsAdmin}
      />
    </div>
  );
}
