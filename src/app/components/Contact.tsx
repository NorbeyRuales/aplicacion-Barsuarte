import { motion } from 'motion/react';
import { Instagram, Facebook, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';

export function Contact() {
  const navigate = useNavigate();

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      label: '317 771 2112',
      href: 'https://wa.me/573177712112',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:shadow-green-200',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      label: '@barsuarteartesanias',
      href: 'https://www.instagram.com/barsuarteartesanias?igsh=MWxvNHExaXIweDc2',
      color: 'from-pink-500 to-fuchsia-600',
      hoverColor: 'hover:shadow-fuchsia-200',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      label: 'Barsuarte Artesanías',
      href: 'https://www.facebook.com/share/17s5czyCHB/',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:shadow-blue-200',
    },
    {
      name: 'Email',
      icon: Mail,
      label: 'BarsuarteArtesanias@gmail.com',
      href: 'https://mail.google.com/mail/?view=cm&fs=1&to=BarsuarteArtesanias@gmail.com',
      color: 'from-fuchsia-500 to-purple-500',
      hoverColor: 'hover:shadow-purple-200',
    },
  ];

  return (
    <section id="contacto" className="py-24 px-4 bg-gradient-to-b from-fuchsia-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
            Conéctate con Nosotros
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-600">
            Estamos aquí para escucharte y crear juntos
          </p>
        </motion.div>

        {/* Redes Sociales */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Información de Contacto
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialLinks.map((social, index) => (
              <motion.div
                key={social.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <a href={social.href} target="_blank" rel="noopener noreferrer">
                  <Card className={`p-6 hover:shadow-2xl ${social.hoverColor} transition-all duration-300 border-2 border-transparent hover:border-fuchsia-300 cursor-pointer group h-full`}>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${social.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <social.icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-center mb-2 text-gray-800">
                      {social.name}
                    </h4>
                    <p className="text-center text-gray-600 text-sm font-medium break-all">
                      {social.label}
                    </p>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-12 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-violet-600 text-white text-center">
            <h3 className="text-4xl font-bold mb-4">
              ¿Listo para crear algo único?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Contáctanos hoy y hagamos realidad tu proyecto artesanal
            </p>
            <Button
              onClick={() => {
                navigate('/clientes/mensajes');
              }}
              className="bg-white text-fuchsia-600 hover:bg-gray-100 text-lg px-8 py-6 font-bold"
            >
              Enviar Mensaje
            </Button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
