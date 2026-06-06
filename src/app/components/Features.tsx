import { motion } from 'motion/react';
import { Sparkles, Palette, Hand, Award, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { Card } from './ui/card';

const features = [
  {
    icon: Sparkles,
    title: 'Porta llaves',
    description: 'Llaveros artesanales únicos con diseños coloridos y tradicionales colombianos',
    color: 'from-fuchsia-500 to-pink-500',
    slug: 'porta-llaves',
  },
  {
    icon: Heart,
    title: 'Imanes',
    description: 'Imanes decorativos hechos a mano, perfectos para regalar y coleccionar',
    color: 'from-purple-500 to-violet-500',
    slug: 'imanes',
  },
  {
    icon: Hand,
    title: 'Porta celulares',
    description: 'Fundas y soportes artesanales con tejidos y acabados únicos',
    color: 'from-fuchsia-600 to-purple-600',
    slug: 'porta-celulares',
  },
  {
    icon: Palette,
    title: 'Cuadros decorativos',
    description: 'Arte hecho a mano para embellecer tus espacios con cultura colombiana',
    color: 'from-pink-500 to-fuchsia-500',
    slug: 'cuadros-decorativos',
  },
  {
    icon: Award,
    title: 'Mini cuadros',
    description: 'Pequeñas obras de arte artesanal, ideales para regalar momentos especiales',
    color: 'from-violet-500 to-purple-500',
    slug: 'mini-cuadros',
  },
  {
    icon: Sparkles,
    title: 'Entre vientos',
    description: 'Móviles y atrapasueños artesanales con materiales naturales y colores vibrantes',
    color: 'from-fuchsia-500 to-violet-600',
    slug: 'entre-vientos',
  },
];

export function Features() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
            ¿Qué encontrarás en Barsuarte Artesanías?
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/productos/${feature.slug}`}>
                <Card className="p-8 h-full hover:shadow-2xl hover:shadow-fuchsia-200 transition-all duration-300 border-2 border-transparent hover:border-fuchsia-300 cursor-pointer group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center justify-between">
                    {feature.title}
                    <ArrowRight className="w-5 h-5 text-fuchsia-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </h3>
                  <p className="text-gray-600 text-lg">{feature.description}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
