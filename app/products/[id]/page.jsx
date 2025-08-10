import ProductDetail from "./_ProductDetails";

export default function ProductPage({ params }) {
  return <ProductDetail params={params} />;
}

export async function generateMetadata({ params }) {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${base}/api/products/${params.id}`, { cache: 'no-store' });
    if (response.ok) {
      const product = await response.json();
      return {
        title: `${product.title} - Hafiz Tech`,
        description: product.description.replace(/<[^>]*>/g, '').substring(0, 160),
        openGraph: {
          title: product.title,
          description: product.description.replace(/<[^>]*>/g, '').substring(0, 160),
          images: product.images || [],
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: 'Product - Hafiz Tech',
    description: 'Quality products at great prices',
  };
}