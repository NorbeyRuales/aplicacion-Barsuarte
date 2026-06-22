import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, Images, MessageCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageHero } from '../components/PageHero';
import { useSupabaseProducts } from '../../hooks/useSupabase';
import { storeProductInquiry } from '../productInquiry';

const categoryConfig = {
  'porta-llaves': {
    title: 'Porta llaves',
    subtitle: 'Llaveros artesanales únicos con diseños coloridos y tradicionales colombianos',
    emoji: '🔑',
    color: 'from-fuchsia-500 to-pink-500',
  },
  'imanes': {
    title: 'Imanes',
    subtitle: 'Imanes decorativos hechos a mano, perfectos para regalar y coleccionar',
    emoji: '🧲',
    color: 'from-purple-500 to-violet-500',
  },
  'porta-celulares': {
    title: 'Porta celulares',
    subtitle: 'Fundas y soportes artesanales con tejidos y acabados únicos',
    emoji: '📱',
    color: 'from-fuchsia-600 to-purple-600',
  },
  'cuadros-decorativos': {
    title: 'Cuadros decorativos',
    subtitle: 'Arte hecho a mano para embellecer tus espacios con cultura colombiana',
    emoji: '🖼️',
    color: 'from-pink-500 to-fuchsia-500',
  },
  'mini-cuadros': {
    title: 'Mini cuadros',
    subtitle: 'Pequeñas obras de arte artesanal, ideales para regalar momentos especiales',
    emoji: '🎨',
    color: 'from-violet-500 to-purple-500',
  },
  'entre-vientos': {
    title: 'Entre vientos',
    subtitle: 'Móviles y atrapasueños artesanales con materiales naturales y colores vibrantes',
    emoji: '🎐',
    color: 'from-fuchsia-500 to-violet-600',
  },
};

export function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { products = [] } = useSupabaseProducts();

  const config = category && category in categoryConfig
    ? categoryConfig[category as keyof typeof categoryConfig]
    : null;

  // Filtrar productos por la categoría guardada por el administrador.
  const categoryProducts = products.filter((item) => item.category === category);
  const startProductInquiry = (product: (typeof products)[number]) => {
    storeProductInquiry(product);
    navigate('/clientes/mensajes');
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Categoría no encontrada</h1>
            <Link to="/productos" className="text-fuchsia-600 hover:text-fuchsia-700 underline">
              Volver a productos
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <PageHero
          title={config.title}
          subtitle={config.subtitle}
          emoji={config.emoji}
        />

        <section className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 text-fuchsia-600 hover:text-fuchsia-700 mb-8 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a todos los productos
            </Link>

            {categoryProducts.length > 0 ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {categoryProducts.length} {categoryProducts.length === 1 ? 'producto' : 'productos'}
                  </h2>
                  <p className="text-gray-600">
                    Explora nuestra selección de {config.title.toLowerCase()}
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                  {categoryProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      data-cy="category-product-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                      className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-fuchsia-200 transition-all duration-300"
                    >
                      {product.media?.[0]?.type === 'video' ? (
                        <video src={product.media?.[0]?.dataUrl} className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <img
                          src={product.media?.[0]?.dataUrl}
                          alt={product.title}
                          className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                      <div className="p-4 bg-white border-t border-gray-100">
                        <h3 data-cy="category-product-title" className="font-bold text-gray-800 mb-1 line-clamp-2">
                          {product.title}
                        </h3>
                        {product.description && <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>}
                        {product.price && (
                          <p className="text-fuchsia-600 font-bold text-lg">
                            {product.price}
                          </p>
                        )}
                        <button
                          data-cy="category-consult-button"
                          onClick={() => startProductInquiry(product)}
                          className="mt-3 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-fuchsia-200 transition-all flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Consultar
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <div className="border-2 border-dashed border-fuchsia-200 rounded-2xl p-10 text-center bg-gradient-to-br from-fuchsia-50 to-purple-50">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                    <Images className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Aún no hay productos en esta categoría
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Los productos de {config.title.toLowerCase()} aparecerán aquí pronto.
                  </p>
                  <p className="text-sm text-gray-400 flex items-center justify-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> El contenido solo puede ser gestionado por el administrador
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />

    </div>
  );
}
