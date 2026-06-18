import { type Product } from '../services/supabase';

const PRODUCT_INQUIRY_PREFILL_KEY = 'barsuarte_prefill';

type InquiryProduct = Pick<Product, 'id' | 'title'>;

export function storeProductInquiry(product: InquiryProduct) {
  localStorage.setItem(
    PRODUCT_INQUIRY_PREFILL_KEY,
    JSON.stringify({
      subject: `Consulta sobre ${product.title}`,
      message: `Estoy interesado en ${product.title}. ID del producto: ${product.id}`,
    })
  );
}
