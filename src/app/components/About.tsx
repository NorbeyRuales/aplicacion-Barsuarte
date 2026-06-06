import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function About() {
  return (
    <section id="nosotros" className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
            Nuestra Historia
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1512617883304-3affd6c4b94e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbWJpYW4lMjBoYW5kbWFkZSUyMGNyYWZ0c3xlbnwxfHx8fDE3ODAwNzE2Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Artesanías colombianas hechas a mano"
              className="w-full h-[500px] object-cover rounded-3xl shadow-2xl hover:shadow-fuchsia-300 transition-shadow duration-300"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="text-xl text-gray-700 leading-relaxed">
              En <span className="font-bold text-fuchsia-600">Barsuarte Artesanías</span> transformamos la creatividad, la cultura y el trabajo artesanal en piezas únicas que cuentan historias. Cada creación refleja la esencia del arte hecho a mano, combinando tradición, calidad y dedicación en cada detalle.
            </p>

            <p className="text-xl text-gray-700 leading-relaxed">
              Ofrecemos artesanías elaboradas con pasión, ideales para decorar espacios, regalar momentos especiales o llevar un pedazo de nuestra identidad cultural a cualquier lugar.
            </p>

            <p className="text-xl text-gray-700 leading-relaxed">
              Nuestro compromiso es <span className="font-bold text-purple-600">preservar el valor de lo artesanal</span> mientras innovamos con diseños auténticos y personalizados.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
