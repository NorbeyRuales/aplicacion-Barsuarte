import { useEffect, useState } from 'react';
import { clientsService, productsService, mediaService, messagesService, type Client, type Product, type Message } from '../services/supabase';

// Hook para sincronizar clientes de localStorage a Supabase
export function useSyncClients() {
  const [syncing, setSyncing] = useState(false);

  const syncClientsToSupabase = async () => {
    setSyncing(true);
    try {
      const localData = localStorage.getItem('barsuarte_clients');
      if (!localData) {
        console.log('No hay clientes locales para migrar');
        setSyncing(false);
        return;
      }

      const clients = JSON.parse(localData);
      const supabaseClients = await clientsService.getAll();

      // Comparar y migrar solo los nuevos
      for (const client of clients) {
        const exists = supabaseClients.find((c) => c.email === client.email);
        if (!exists) {
          await clientsService.create({
            name: client.name,
            surname: client.surname,
            email: client.email,
            phone: client.phone,
            password: client.password, // ⚠️ Nota: Considera encriptar esto en producción
          });
          console.log(`✅ Cliente ${client.email} migrado a Supabase`);
        }
      }
    } catch (error) {
      console.error('Error sincronizando clientes:', error);
    } finally {
      setSyncing(false);
    }
  };

  return { syncClientsToSupabase, syncing };
}

// Hook para sincronizar productos de localStorage a Supabase
export function useSyncProducts() {
  const [syncing, setSyncing] = useState(false);

  const syncProductsToSupabase = async () => {
    setSyncing(true);
    try {
      const localData = localStorage.getItem('barsuarte_products');
      if (!localData) {
        console.log('No hay productos locales para migrar');
        setSyncing(false);
        return;
      }

      const localProducts = JSON.parse(localData);
      const supabaseProducts = await productsService.getAll();

      // Migrar productos
      for (const product of localProducts) {
        const exists = supabaseProducts.find((p) => p.title === product.title);
        if (!exists) {
          const created = await productsService.create({
            title: product.title,
            description: product.description || '',
            category: product.category,
            price: product.price || '',
          });

          if (created && product.media) {
            for (const mediaItem of product.media) {
              await mediaService.addMedia(created.id, {
                type: mediaItem.type || 'image',
                data_url: mediaItem.data_url || mediaItem.url || '',
                name: mediaItem.name || mediaItem.filename || 'media',
                uploaded_at: mediaItem.uploaded_at || new Date().toISOString(),
              });
            }
            console.log(`✅ Producto ${product.title} y su media migrados`);
          }
        }
      }
    } catch (error) {
      console.error('Error sincronizando productos:', error);
    } finally {
      setSyncing(false);
    }
  };

  return { syncProductsToSupabase, syncing };
}

// Hook para sincronizar mensajes de localStorage a Supabase
export function useSyncMessages() {
  const [syncing, setSyncing] = useState(false);

  const syncMessagesToSupabase = async () => {
    setSyncing(true);
    try {
      const localData = localStorage.getItem('barsuarte_messages');
      if (!localData) {
        console.log('No hay mensajes locales para migrar');
        setSyncing(false);
        return;
      }

      const messages = JSON.parse(localData);
      const supabaseMessages = await messagesService.getAll();

      // Migrar mensajes
      for (const message of messages) {
        const exists = supabaseMessages.find((m) => m.id === message.id);
        if (!exists) {
          await messagesService.create({
            client_id: message.clientId,
            client_name: message.clientName,
            subject: message.subject,
            message: message.message,
            status: message.status,
          });
          console.log(`✅ Mensaje ${message.subject} migrado a Supabase`);
        }
      }
    } catch (error) {
      console.error('Error sincronizando mensajes:', error);
    } finally {
      setSyncing(false);
    }
  };

  return { syncMessagesToSupabase, syncing };
}

// Hook para cargar todos los datos desde Supabase (usar en lugar de localStorage)
export function useSupabaseClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    setLoading(true);
    const data = await clientsService.getAll();
    setClients(data);
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  return { clients, loading, refresh: loadClients };
}

export function useSupabaseProducts() {
  const [products, setProducts] = useState<(Product & { media?: any[] })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    const data = await productsService.getAllWithMedia();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
    // Polling cada 2 segundos (como el localStorage)
    const interval = setInterval(loadProducts, 2000);
    return () => clearInterval(interval);
  }, []);

  return { products, loading, refresh: loadProducts };
}

export function useSupabaseMessages(clientId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    setLoading(true);
    const data = clientId
      ? await messagesService.getByClientId(clientId)
      : await messagesService.getAll();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
    // Polling cada 2 segundos
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [clientId]);

  return { messages, loading, refresh: loadMessages };
}
