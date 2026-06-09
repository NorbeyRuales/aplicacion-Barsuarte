import { createClient } from '@supabase/supabase-js';

const env = ((import.meta as unknown) as { env?: Record<string, string | undefined> }).env ?? {};

const SUPABASE_URL = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || 'https://lqwyfufwugxupqpyzcgn.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable__t-_6R6E8Py2bhx65_RrnA_uuhPC724';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Las credenciales de Supabase no están configuradas. Revisa tu archivo .env.local');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const STORAGE_BUCKET = 'product-media';

export async function uploadFileToStorage(file: File): Promise<string | null> {
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2)}-${sanitizedFilename}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, { cacheControl: '3600', upsert: true });

  if (uploadError) {
    console.error('Error uploading file to Supabase Storage:', uploadError);
    return null;
  }

  const publicUrlResult = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return publicUrlResult.data.publicUrl;
}

// ==================== CLIENTES ====================
export interface Client {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
}

const mapClientRow = (row: any): Client => ({
  id: row.id,
  name: row.name,
  surname: row.surname,
  email: row.email,
  phone: row.phone,
  password: row.password,
  createdAt: row.created_at,
});

const mapProductMediaRow = (row: any): ProductMedia => ({
  id: row.id,
  productId: row.product_id,
  type: row.type,
  dataUrl: row.data_url,
  name: row.name,
  uploadedAt: row.uploaded_at,
});

const mapProductRow = (row: any): Product => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  price: row.price,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapProductWithMedia = (row: any, media: any[]): Product & { media: ProductMedia[] } => ({
  ...mapProductRow(row),
  media: (media || []).map(mapProductMediaRow),
});

const mapMessageRow = (row: any): Message => ({
  id: row.id,
  clientId: row.client_id,
  clientName: row.client_name,
  subject: row.subject,
  message: row.message,
  status: row.status,
  createdAt: row.created_at,
  adminResponse: row.admin_response || '',
  respondedAt: row.responded_at || undefined,
});

// ==================== ADMINS ====================
export interface Admin {
  id: string;
  clientId: string;
  email: string;
  createdAt: string;
}

const mapAdminRow = (row: any): Admin => ({
  id: row.id,
  clientId: row.client_id,
  email: row.email,
  createdAt: row.created_at,
});

export const adminsService = {
  async getAll(): Promise<Admin[]> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admins:', error);
      return [];
    }
    return (data || []).map(mapAdminRow);
  },

  async getByEmail(email: string): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (!data) return null;
      console.error('Error fetching admin:', error);
      return null;
    }
    return data ? mapAdminRow(data) : null;
  },

  async create(clientId: string, email: string): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('admins')
      .insert([{ client_id: clientId, email, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('Error creating admin:', error);
      return null;
    }
    return data ? mapAdminRow(data) : null;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting admin:', error);
      return false;
    }
    return true;
  },
};

export const clientsService = {
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
    return (data || []).map(mapClientRow);
  },

  async getByEmail(email: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (!data) return null;
      console.error('Error fetching client:', error);
      return null;
    }
    return data ? mapClientRow(data) : null;
  },

  async create(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .insert([{ ...client, created_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating client:', error);
      return null;
    }
    return data ? mapClientRow(data) : null;
  },

  async update(id: string, updates: Partial<Client>): Promise<Client | null> {
    const rowUpdates: any = { ...updates };
    if ('createdAt' in rowUpdates) {
      rowUpdates.created_at = rowUpdates.createdAt;
      delete rowUpdates.createdAt;
    }

    const { data, error } = await supabase
      .from('clients')
      .update(rowUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating client:', error);
      return null;
    }
    return data ? mapClientRow(data) : null;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting client:', error);
      return false;
    }
    return true;
  },
};

// ==================== PRODUCTOS ====================
export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMedia {
  id: string;
  productId: string;
  type: 'image' | 'video';
  dataUrl: string;
  name: string;
  uploadedAt: string;
}

export const productsService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return (data || []).map(mapProductRow);
  },

  async getWithMedia(id: string): Promise<(Product & { media: ProductMedia[] }) | null> {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError) {
      console.error('Error fetching product:', productError);
      return null;
    }

    const { data: media, error: mediaError } = await supabase
      .from('product_media')
      .select('*')
      .eq('product_id', id)
      .order('uploaded_at', { ascending: true });

    if (mediaError) {
      console.error('Error fetching media:', mediaError);
      return { ...mapProductRow(product), media: [] };
    }

    return mapProductWithMedia(product, media || []);
  },

  async getAllWithMedia(): Promise<(Product & { media: ProductMedia[] })[]> {
    const products = await this.getAll();
    const productsWithMedia = await Promise.all(
      products.map(async (product) => {
        const { data: media = [], error } = await supabase
          .from('product_media')
          .select('*')
          .eq('product_id', product.id)
          .order('uploaded_at', { ascending: true });
        if (error) {
          console.error('Error fetching media for product:', product.id, error);
        }
        return { ...product, media: (media || []).map(mapProductMediaRow) };
      })
    );
    return productsWithMedia;
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...product, created_at: now, updated_at: now }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      return null;
    }
    return data ? mapProductRow(data) : null;
  },

  async createWithMedia(
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
    mediaItems: Array<Omit<ProductMedia, 'id' | 'productId'>>
  ): Promise<(Product & { media: ProductMedia[] }) | null> {
    const createdProduct = await this.create(product);
    if (!createdProduct) return null;

    const createdMedia: ProductMedia[] = [];
    for (const item of mediaItems) {
      const media = await mediaService.addMedia(createdProduct.id, item);
      if (media) {
        createdMedia.push(media);
      }
    }

    return { ...createdProduct, media: createdMedia };
  },

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const rowUpdates: any = { ...updates };
    if ('createdAt' in rowUpdates) {
      rowUpdates.created_at = rowUpdates.createdAt;
      delete rowUpdates.createdAt;
    }
    if ('updatedAt' in rowUpdates) {
      rowUpdates.updated_at = rowUpdates.updatedAt;
      delete rowUpdates.updatedAt;
    }

    const { data, error } = await supabase
      .from('products')
      .update({ ...rowUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      return null;
    }
    return data ? mapProductRow(data) : null;
  },

  async delete(id: string): Promise<boolean> {
    // Primero eliminar media
    const { error: mediaError } = await supabase
      .from('product_media')
      .delete()
      .eq('product_id', id);

    if (mediaError) {
      console.error('Error deleting media:', mediaError);
      return false;
    }

    // Luego eliminar producto
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    return true;
  },
};

export const mediaService = {
  async addMedia(productId: string, media: Omit<ProductMedia, 'id' | 'productId'>): Promise<ProductMedia | null> {
    const { data, error } = await supabase
      .from('product_media')
      .insert([
        {
          product_id: productId,
          type: media.type,
          data_url: media.dataUrl,
          name: media.name,
          uploaded_at: media.uploadedAt,
        },
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding media:', error);
      return null;
    }
    return data ? mapProductMediaRow(data) : null;
  },

  async deleteMedia(mediaId: string): Promise<boolean> {
    const { error } = await supabase
      .from('product_media')
      .delete()
      .eq('id', mediaId);
    
    if (error) {
      console.error('Error deleting media:', error);
      return false;
    }
    return true;
  },

  async getByProductId(productId: string): Promise<ProductMedia[]> {
    const { data, error } = await supabase
      .from('product_media')
      .select('*')
      .eq('product_id', productId)
      .order('uploaded_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching media:', error);
      return [];
    }
    return (data || []).map(mapProductMediaRow);
  },
};

// ==================== MENSAJES ====================
export interface Message {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  message: string;
  status: 'pending' | 'answered';
  createdAt: string;
  adminResponse?: string;
  respondedAt?: string;
}

export const messagesService = {
  async getAll(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    return (data || []).map(mapMessageRow);
  },

  async getByClientId(clientId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    return (data || []).map(mapMessageRow);
  },

  async getPending(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pending messages:', error);
      return [];
    }
    return (data || []).map(mapMessageRow);
  },

  async create(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message | null> {
    const row = {
      client_id: message.clientId,
      client_name: message.clientName,
      subject: message.subject,
      message: message.message,
      status: message.status,
      admin_response: message.adminResponse || null,
      responded_at: message.respondedAt || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([row])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating message:', error);
      return null;
    }
    return data ? mapMessageRow(data) : null;
  },

  async respond(messageId: string, response: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .update({
        status: 'answered',
        admin_response: response,
        responded_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) {
      console.error('Error responding to message:', error);
      return null;
    }
    return data ? mapMessageRow(data) : null;
  },

  async delete(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
    
    if (error) {
      console.error('Error deleting message:', error);
      return false;
    }
    return true;
  },
};
