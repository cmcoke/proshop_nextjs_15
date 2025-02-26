/**
 * This component renders the homepage of the application.
 * It displays a product list of newest arrivals using sample data.
 */

import ProductList from "@/components/shared/product/product-list";
import sampleData from "@/db/sample-data";

const HomePage = () => {
  return (
    <div className="space-y-8">
      <ProductList title="Newest Arrivals" data={sampleData.products} limit={4} />
    </div>
  );
};

export default HomePage;
