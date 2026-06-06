import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Play, Images, Lock } from 'lucide-react';
import { groupMediaByProduct, loadMedia, type ProductItem } from './AdminPanel';

const defaultImages = [
  {
    url: 'https://images.unsplash.com/photo-1615640325967-af4cfa4c0c6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGhhbmRtYWRlJTIwYXJ0aXNhbiUyMHByb2R1Y3RzfGVufDF8fHx8MTc4MDA3MTYyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    alt: 'Producto artesanal 1',
  },
  {
    url: 'https://images.unsplash.com/photo-1455669175216-9017c9b02fc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3ZlbiUyMGJhc2tldCUyMGNyYWZ0c3xlbnwxfHx8fDE3ODAwNzE2Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    alt: 'Producto artesanal 2',
  },
  {
    url: 'https://images.unsplash.com/photo-1631125915732-b98f8774f675?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRtYWRlfGVufDF8fHx8MTc4MDA3MTYyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    alt: 'Producto artesanal 3',
  },
];

interface GalleryProps {
  onAdminClick: () => void;
}

export function Gallery({ onAdminClick }: GalleryProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos'>('all');

  useEffect(() => {
    const refresh = () => setProducts(groupMediaByProduct(loadMedia()));
    refresh();
    window.addEventListener('storage', refresh);
    const interval = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener('storage', refresh);
      clearInterval(interval);
    };
  }, []);

  const uploadedImages = products.filter((product) => product.media.some((item) => item.type === 'image'));
  const uploadedVideos = products.filter((product) => product.media.some((item) => item.type === 'video'));

  const hasUploaded = products.length > 0;

  return (
    <section id="galeria" className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-fuchsia-100 text-fuchsia-700 text-sm font-semibold mb-4">
            Nuestras Creaciones
          </span>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
            Galería de Productos
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 mx-auto rounded-full mb-6" />
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explora nuestras creaciones únicas y personalizadas, cada pieza contada con amor artesanal
          </p>
        </motion.div>

        {hasUploaded && (
          <div className="flex justify-center gap-2 mb-10">
            {(['all', 'images', 'videos'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md shadow-fuchsia-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-fuchsia-50 hover:text-fuchsia-600'
                }`}
              >
                {tab === 'all' ? 'Todo' : tab === 'images' ? `Fotos (${uploadedImages.length})` : `Videos (${uploadedVideos.length})`}
              </button>
            ))}
          </div>
        )}

        {/* Images grid */}
        {(activeTab === 'all' || activeTab === 'images') && (
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {uploadedImages.length > 0
              ? uploadedImages.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-fuchsia-200 transition-all duration-300"
                  >
                    {product.media[0]?.type === 'video' ? (
                      <video src={product.media[0].dataUrl} className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <img
                        src={product.media[0]?.dataUrl}
                        alt={product.title}
                        className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="p-4 bg-white border-t border-gray-100">
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                      )}
                      {product.price && (
                        <p className="text-fuchsia-600 font-bold text-lg">
                          {product.price}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))
              : defaultImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-fuchsia-200 transition-all duration-300"
                  >
                    <ImageWithFallback
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <p className="text-white text-xl font-bold p-6">{image.alt}</p>
                    </div>
                  </motion.div>
                ))}
          </div>
        )}

        {/* Videos */}
        {(activeTab === 'all' || activeTab === 'videos') && uploadedVideos.length > 0 && (
          <div className="mb-10">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-600" /> Videos del proceso artesanal
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {uploadedVideos.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-2xl overflow-hidden shadow-lg border border-purple-100"
                >
                  <video src={product.media.find((item) => item.type === 'video')?.dataUrl} controls className="w-full h-56 object-cover bg-black" />
                  {product.description && (
                    <div className="px-4 py-2 bg-gradient-to-r from-fuchsia-50 to-purple-50">
                      <p className="text-sm text-gray-600">{product.description}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Upload prompt for visitors */}
        {!hasUploaded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4"
          >
            <div className="border-2 border-dashed border-fuchsia-200 rounded-2xl p-10 text-center bg-gradient-to-br from-fuchsia-50 to-purple-50">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center">
                <Images className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600 mb-2">Las fotos y videos de productos aparecerán aquí.</p>
              <p className="text-sm text-gray-400 flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5" /> El contenido solo puede ser gestionado por el administrador
              </p>
            </div>
          </motion.div>
        )}

        {/* Admin hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <button
            onClick={onAdminClick}
            className="text-xs text-gray-300 hover:text-fuchsia-400 transition-colors flex items-center gap-1 mx-auto"
          >
            <Lock className="w-3 h-3" /> Administrar contenido
          </button>
        </motion.div>
      </div>

    </section>
  );
}
