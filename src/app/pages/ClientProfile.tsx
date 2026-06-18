import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { motion } from 'motion/react';
import { User, Trash, Check } from 'lucide-react';
import { clientsService, type Client as SupabaseClient } from '../../services/supabase';
import { ADMIN_SESSION_KEY, saveAppSession } from '../session';

interface OutletContext {
  client: SupabaseClient;
  setClient: (client: SupabaseClient | null) => void;
  logout: () => void;
}

export function ClientProfile() {
  const { client, setClient, logout } = useOutletContext<OutletContext>();
  const [name, setName] = useState(client?.name || '');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [password, setPassword] = useState(client?.password || '');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName(client?.name || '');
    setSurname(client?.surname || '');
    setEmail(client?.email || '');
    setPhone(client?.phone || '');
    setPassword(client?.password || '');
  }, [client]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedClient = await clientsService.update(client.id, {
      name,
      surname,
      email,
      phone,
      password,
    });

    if (!updatedClient) {
      setSuccess('No se pudo actualizar el perfil. Intenta de nuevo.');
      setTimeout(() => setSuccess(''), 3000);
      return;
    }

    const adminEmail = localStorage.getItem(ADMIN_SESSION_KEY);
    const role = adminEmail && adminEmail.toLowerCase() === client.email.toLowerCase() ? 'admin' : 'client';
    saveAppSession(updatedClient, role);
    setClient(updatedClient);
    setSuccess('Perfil actualizado correctamente');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar tu cuenta? Esta acción no se puede deshacer.')) return;

    const deleted = await clientsService.delete(client.id);
    if (!deleted) {
      setSuccess('No se pudo eliminar la cuenta. Intenta de nuevo.');
      setTimeout(() => setSuccess(''), 3000);
      return;
    }

    logout();
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
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="px-4 py-3 bg-fuchsia-600 text-white rounded-lg flex items-center gap-2"><Check className="w-4 h-4"/> Actualizar Información</button>
              <button type="button" onClick={handleDelete} className="px-4 py-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"><Trash className="w-4 h-4"/> Eliminar cuenta</button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
