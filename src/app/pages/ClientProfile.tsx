import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { User, Trash, Check } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
}

interface OutletContext {
  client: Client;
}

const CLIENTS_KEY = 'barsuarte_clients';
const CURRENT_CLIENT_KEY = 'barsuarte_current_client';

export function ClientProfile() {
  const { client } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const [name, setName] = useState(client?.name || '');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState(client?.password || '');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName(client?.name || '');
    setSurname(client?.surname || '');
    setEmail(client?.email || '');
    setPhone(client?.phone || '');
    setPassword(client?.password || '');
  }, [client]);

  const getClients = () => {
    try {
      const data = localStorage.getItem(CLIENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveClients = (arr: any[]) => {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(arr));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const all = getClients();
    const updated = all.map((c: Client) =>
      c.id === client.id ? { ...c, name, surname, email, phone, password } : c
    );
    saveClients(updated);
    const updatedClient = { ...client, name, surname, email, phone, password };
    localStorage.setItem(CURRENT_CLIENT_KEY, JSON.stringify(updatedClient));
    setSuccess('Perfil actualizado correctamente');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = () => {
    if (!confirm('¿Eliminar tu cuenta? Esta acción no se puede deshacer.')) return;
    const all = getClients();
    const updated = all.filter((c: Client) => c.id !== client.id);
    saveClients(updated);
    localStorage.removeItem(CURRENT_CLIENT_KEY);
    navigate('/clientes');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Mi Perfil</h2>
              <p className="text-sm text-gray-500">Actualiza tus datos o elimina tu cuenta</p>
            </div>
          </div>

          {success && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input value={surname} onChange={(e) => setSurname(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono celular</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="px-4 py-3 bg-fuchsia-600 text-white rounded-lg flex items-center gap-2"><Check className="w-4 h-4"/> Guardar cambios</button>
              <button type="button" onClick={handleDelete} className="px-4 py-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"><Trash className="w-4 h-4"/> Eliminar cuenta</button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
