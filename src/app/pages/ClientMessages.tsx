import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Send, MessageSquare, Clock, CheckCircle2, User } from 'lucide-react';
import { useOutletContext } from 'react-router';
import { useSupabaseMessages } from '../../hooks/useSupabase';
import { messagesService, type Client, type Message } from '../../services/supabase';

interface OutletContext {
  client: Client;
}

export function ClientMessages() {
  const { client } = useOutletContext<OutletContext>();
  const { messages, refresh } = useSupabaseMessages(client.id);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    try {
      const pre = localStorage.getItem('barsuarte_prefill');
      if (pre) {
        const obj = JSON.parse(pre);
        if (obj.subject) setSubject(obj.subject);
        if (obj.message) setMessage(obj.message);
        localStorage.removeItem('barsuarte_prefill');
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const created = await messagesService.create({
      clientId: client.id,
      clientName: `${client.name} ${client.surname || ''}`.trim(),
      subject,
      message,
      status: 'pending',
    });

    if (!created) {
      return;
    }

    setSubject('');
    setMessage('');
    setShowSuccess(true);
    refresh();

    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Send Message Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Contactar Administrador</h2>
              <p className="text-sm text-gray-500">Te responderemos pronto</p>
            </div>
          </div>

          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Mensaje enviado exitosamente
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Asunto
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="¿En qué podemos ayudarte?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mensaje
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu consulta aquí..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-fuchsia-300 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Enviar Mensaje
            </button>
          </form>
        </div>
      </motion.div>

      {/* Messages History */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Historial de Mensajes</h2>

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-fuchsia-400" />
              </div>
              <p className="text-gray-500">Aún no tienes mensajes</p>
              <p className="text-sm text-gray-400 mt-1">
                Envía tu primera consulta usando el formulario
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-2 rounded-xl p-4 ${
                    msg.status === 'answered'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{msg.subject}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        msg.status === 'answered'
                          ? 'bg-green-200 text-green-700'
                          : 'bg-yellow-200 text-yellow-700'
                      }`}
                    >
                      {msg.status === 'answered' ? 'Respondido' : 'Pendiente'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{msg.message}</p>

                  {msg.adminResponse && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          Respuesta del Administrador
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 bg-white rounded-lg p-3">
                        {msg.adminResponse}
                      </p>
                      {msg.respondedAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(msg.respondedAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
