import { ProductCarousel } from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts, getFeaturedProducts } from "@/lib/actions/product.actions";

const HomePage = async () => {
  const latestProducts = await getLatestProducts();

  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="space-y-8">
      {featuredProducts.length > 0 && <ProductCarousel data={featuredProducts} />}
      <ProductList title="Newest Arrivals" data={latestProducts} limit={4} />
    </div>
  );
};

export default HomePage;
