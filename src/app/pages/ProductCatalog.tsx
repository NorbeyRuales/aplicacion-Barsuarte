import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ShoppingBag,
  Search,
  Filter,
  Heart,
  MessageCircle,
  Image,
  X,
  Key,
  Magnet,
  Smartphone,
  Palette,
  Feather,
  LayoutGrid,
} from 'lucide-react';
import { useOutletContext } from 'react-router';
import { useSupabaseProducts } from '../../hooks/useSupabase';
import { type Product, type ProductMedia } from '../../services/supabase';

interface Client {
  id: string;
  name: string;
  surname: string;
  email: string;
}

interface OutletContext {
  client: Client;
}

const categoryLabels: Record<string, React.ReactNode> = {
  'all': (
    <span className="flex items-center gap-2">
      <LayoutGrid className="w-4 h-4" /> Todos
    </span>
  ),
  'porta-llaves': (
    <span className="flex items-center gap-2">
      <Key className="w-4 h-4" /> Porta llaves
    </span>
  ),
  'imanes': (
    <span className="flex items-center gap-2">
      <Magnet className="w-4 h-4" /> Imanes
    </span>
  ),
  'porta-celulares': (
    <span className="flex items-center gap-2">
      <Smartphone className="w-4 h-4" /> Porta celulares
    </span>
  ),
  'cuadros-decorativos': (
    <span className="flex items-center gap-2">
      <Image className="w-4 h-4" /> Cuadros decorativos
    </span>
  ),
  'mini-cuadros': (
    <span className="flex items-center gap-2">
      <Palette className="w-4 h-4" /> Mini cuadros
    </span>
  ),
  'entre-vientos': (
    <span className="flex items-center gap-2">
      <Feather className="w-4 h-4" /> Entre vientos
    </span>
  ),
};

export function ProductCatalog() {
  const { client } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const { products, loading } = useSupabaseProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<(Product & { media?: ProductMedia[] }) | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`favorites_${client.id}`);
    if (saved) setFavorites(JSON.parse(saved));
  }, [client.id]);

  const toggleFavorite = (productId: string) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${client.id}`, JSON.stringify(newFavorites));
  };

  const filteredProducts = (products as (Product & { media?: ProductMedia[] })[]).filter((p) => {
    const text = `${p.title} ${p.description}`.toLowerCase();
    const matchesSearch = text.includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openMessageFlow = (product: Product & { media?: ProductMedia[] }) => {
    const savedClient = localStorage.getItem('barsuarte_current_client');
    if (!savedClient) {
      navigate('/clientes', { replace: true });
      return;
    }

    try {
      const prefill = JSON.stringify({
        subject: `Consulta sobre ${product.title}`,
        message: `Estoy interesado en ${product.title}. ID del producto: ${product.id}`,
      });
      localStorage.setItem('barsuarte_prefill', prefill);
    } catch {}
    navigate('/clientes/mensajes');
  };

  const selectedMedia = selectedProduct?.media ?? [];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
              Catálogo de Productos
            </h2>
            <p className="text-gray-600 mt-1">
              Explora nuestras artesanías colombianas hechas a mano
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-fuchsia-200">
            <ShoppingBag className="w-5 h-5 text-fuchsia-600" />
            <span className="text-sm font-medium text-gray-700">
              {filteredProducts.length} productos
            </span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            {Object.keys(categoryLabels).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-fuchsia-300'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-fuchsia-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Intenta con otra búsqueda'
              : 'El administrador aún no ha subido productos'}
          </p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-fuchsia-200 transition-all duration-300 group"
            >
              <div
                className="relative h-64 overflow-hidden cursor-pointer"
                onClick={() => {
                  const savedClient = localStorage.getItem('barsuarte_current_client');
                  if (!savedClient) {
                    navigate('/clientes', { replace: true });
                    return;
                  }
                  setSelectedProduct(product);
                }}
              >
                {product.media?.[0]?.type === 'video' ? (
                  <video
                    src={product.media?.[0]?.dataUrl}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <img
                    src={product.media?.[0]?.dataUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Favorite button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg"
                >
                  <Heart
                    className={`w-5 h-5 transition-all ${
                      favorites.includes(product.id)
                        ? 'fill-fuchsia-600 text-fuchsia-600'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                  {product.title}
                </h3>
                {product.description && (
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                )}
                {product.price && (
                  <p className="text-fuchsia-600 font-bold text-xl mb-3">
                    {product.price}
                  </p>
                )}
                {product.category && (
                  <span className="inline-block text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full mb-3">
                    {categoryLabels[product.category] || product.category}
                  </span>
                )}
                <button
                  onClick={() => {
                    const savedClient = localStorage.getItem('barsuarte_current_client');
                    if (!savedClient) {
                      navigate('/clientes', { replace: true });
                      return;
                    }
                    setSelectedProduct(product);
                  }}
                  className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-fuchsia-300 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Consultar disponibilidad
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl"
          >
            <div className="grid md:grid-cols-2 max-h-[85vh] overflow-hidden">
              <div className="p-4 bg-gray-50 overflow-y-auto space-y-3">
                {selectedMedia.map((item) => (
                  <div key={item.id} className="rounded-2xl overflow-hidden bg-black/5">
                    {item.type === 'video' ? (
                      <video src={item.dataUrl} controls className="w-full h-72 object-cover bg-black" />
                    ) : (
                      <img src={item.dataUrl} alt={selectedProduct.title} className="w-full h-72 object-cover" />
                    )}
                  </div>
                ))}
              </div>
              <div className="p-8 overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedProduct.title}
                </h2>
                {selectedProduct.description && <p className="text-gray-600 mb-4">{selectedProduct.description}</p>}
                {selectedProduct.price && (
                  <p className="text-fuchsia-600 font-bold text-3xl mb-4">
                    {selectedProduct.price}
                  </p>
                )}
                {selectedProduct.category && (
                  <span className="inline-block text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full mb-4">
                    {categoryLabels[selectedProduct.category] || selectedProduct.category}
                  </span>
                )}
                <p className="text-gray-600 mb-6">
                  Artesanía colombiana hecha a mano con tradición y alma cultural. Cada pieza puede incluir fotos y videos del producto real.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const savedClient = localStorage.getItem('barsuarte_current_client');
                      if (!savedClient) {
                        navigate('/clientes', { replace: true });
                        return;
                      }
                      toggleFavorite(selectedProduct.id);
                    }}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      favorites.includes(selectedProduct.id)
                        ? 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(selectedProduct.id) ? 'fill-current' : ''
                      }`}
                    />
                    {favorites.includes(selectedProduct.id) ? 'Guardado' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => openMessageFlow(selectedProduct)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-fuchsia-300 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contactar
                  </button>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 py-2"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
