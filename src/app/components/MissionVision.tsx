import { motion } from 'motion/react';
import { Target, Eye } from 'lucide-react';
import { Card } from './ui/card';

export function MissionVision() {
  return (
    <section id="mision" className="py-24 px-4 bg-gradient-to-b from-purple-50 to-fuchsia-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
            Nuestra Esencia
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-10 h-full bg-white hover:shadow-2xl hover:shadow-fuchsia-200 transition-all duration-300 border-2 border-transparent hover:border-fuchsia-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-gray-800">Nuestra Misión</h3>
              </div>
              <p className="text-xl text-gray-700 leading-relaxed">
                Promover el arte artesanal y apoyar el talento creativo mediante productos que transmiten historia, identidad y emoción.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-10 h-full bg-white hover:shadow-2xl hover:shadow-purple-200 transition-all duration-300 border-2 border-transparent hover:border-purple-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-gray-800">Nuestra Visión</h3>
              </div>
              <p className="text-xl text-gray-700 leading-relaxed">
                Ser una marca reconocida por la autenticidad y calidad de nuestras artesanías, llevando el arte hecho a mano a más personas dentro y fuera de Colombia.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
