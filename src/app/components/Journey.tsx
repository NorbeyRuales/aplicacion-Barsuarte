import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useSupabaseStories } from '../../hooks/useSupabase';

export function Journey() {
  const navigate = useNavigate();
  const { stories, loading } = useSupabaseStories({ approvedOnly: true });

  // Placeholder para fotos de trayectoria
  const journeyImages = [
    {
      url: 'https://images.unsplash.com/photo-1721508490084-1b1de5b230d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGhhbmRpY3JhZnRzJTIwd29ya3Nob3B8ZW58MXx8fHwxNzgwMDcxNjI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Nuestro Taller',
    },
    {
      url: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwY3JlYXRpbmclMjBoYW5kbWFkZXxlbnwxfHx8fDE3ODAwNzE2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'El Proceso Creativo',
    },
  ];

  return (
    <section id="trayectoria" className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
            Nuestra Trayectoria
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-600">
            Conoce el camino que nos ha traído hasta aquí
          </p>
        </motion.div>

        {/* Grid de fotos de trayectoria */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {journeyImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative group overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-purple-200 transition-all duration-300"
            >
              <ImageWithFallback
                src={image.url}
                alt={image.title}
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-fuchsia-900/50 to-transparent flex items-end">
                <div className="p-8 w-full">
                  <h3 className="text-3xl font-bold text-white mb-2">{image.title}</h3>
                  <div className="w-16 h-1 bg-white rounded-full"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Emprendimientos de la comunidad
            </h3>
            <p className="text-gray-600">
              Historias compartidas por clientes y aprobadas por el administrador
            </p>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-8">Cargando historias...</div>
          ) : stories.length === 0 ? (
            <div className="text-center py-10 rounded-2xl border border-dashed border-fuchsia-200 bg-fuchsia-50/60">
              <p className="text-gray-600">Aún no hay emprendimientos aprobados.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story, index) => (
                <motion.article
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl hover:shadow-purple-100 transition-all"
                >
                  <img src={story.imageUrl} alt={story.title} className="w-full h-56 object-cover" />
                  <div className="p-5">
                    <p className="text-xs text-fuchsia-600 font-medium mb-2">{story.clientName}</p>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{story.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{story.description}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </motion.div>

        {/* Espacio para subir emprendimientos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-12 border-2 border-dashed border-purple-300 hover:border-purple-500 transition-colors duration-300 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                <Upload className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-800">
                Comparte tu Historia
              </h3>
              <p className="text-xl text-gray-600 mb-8">
                Publica tu emprendimiento con una imagen y una breve descripción. El administrador revisará tu historia antes de mostrarla en esta página.
              </p>
              <Button
                onClick={() => navigate('/clientes/historia')}
                className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 hover:from-fuchsia-700 hover:via-purple-700 hover:to-violet-700 text-white text-lg px-8 py-6"
              >
                Compartir emprendimiento
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
