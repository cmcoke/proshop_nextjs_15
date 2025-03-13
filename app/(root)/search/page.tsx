import Pagination from "@/components/shared/pagination";
import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { getAllCategories, getAllProducts } from "@/lib/actions/product.actions";
import Link from "next/link";

// Array representing different price ranges for filtering products
const prices = [
  {
    name: "$1 to $50",
    value: "1-50"
  },
  {
    name: "$51 to $100",
    value: "51-100"
  },
  {
    name: "$101 to $200",
    value: "101-200"
  },
  {
    name: "$201 to $500",
    value: "201-500"
  },
  {
    name: "$501 to $1000",
    value: "501-1000"
  }
];

// Array of ratings representing minimum ratings for filtering products by customer reviews
const ratings = [4, 3, 2, 1];

// Array of sorting options available for sorting products
const sortOrders = ["newest", "lowest", "highest", "rating"];

/*
  Generates metadata for the search page based on provided search parameters.

  Parameters:
  - `props.searchParams`: A Promise resolving to an object containing:
    - `q`: Search query string.
    - `category`: Selected category filter.
    - `price`: Price range filter.
    - `rating`: Minimum rating filter.

  Returns:
  - An object containing the `title` property, dynamically constructed based on the applied filters.
*/
export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string;
    category: string;
    price: string;
    rating: string;
  }>;
}) {
  // Waits for searchParams to resolve and sets default values if not provided.
  const { q = "all", category = "all", price = "all", rating = "all" } = await props.searchParams;

  // Checks if each search parameter is set (not "all" and not empty after trimming whitespace).
  const isQuerySet = q && q !== "all" && q.trim() !== "";
  const isCategorySet = category && category !== "all" && category.trim() !== "";
  const isPriceSet = price && price !== "all" && price.trim() !== "";
  const isRatingSet = rating && rating !== "all" && rating.trim() !== "";

  // If at least one filter is applied, generate a dynamic title based on selected filters.
  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `Search ${isQuerySet ? q : ""}
      ${isCategorySet ? `: Category ${category}` : ""}
      ${isPriceSet ? `: Price ${price}` : ""}
      ${isRatingSet ? `: Rating ${rating}` : ""}`
    };
  } else {
    // Default title when no filters are applied.
    return {
      title: `Search`
    };
  }
}

/*
  Represents the props passed into the SearchPage component, containing search parameters that are used to filter and sort products.

  Parameters:
  - `q`: An optional search query string used to filter products by name or description.
  - `category`: An optional filter to narrow down products to a specific category.
  - `price`: An optional filter to specify a price range for the products (e.g., "1-50", "51-100").
  - `rating`: An optional filter to filter products based on customer ratings (e.g., "4" for 4 stars or higher).
  - `sort`: An optional parameter to define the sorting order of the products (e.g., "newest", "lowest", "highest", "rating").
  - `page`: An optional parameter to specify which page of results to display, useful for pagination (default is "1").

  Returns:
  - A Promise that resolves to an object containing the parameters mentioned above, used to filter and sort the products on the SearchPage.
*/
const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  // Destructure and assign default values to the resolved `searchParams` object
  const { q = "all", category = "all", price = "all", rating = "all", sort = "newest", page = "1" } = await props.searchParams;

  // console.log(q, category, price, rating, sort, page);

  /*
  Constructs a URL with query parameters for filtering products based on various criteria.

  Parameters:
  - `c` (optional): Selected category filter.
  - `s` (optional): Sorting option (e.g., "lowest", "highest", "rating").
  - `p` (optional): Price range filter (e.g., "1-50").
  - `r` (optional): Minimum rating filter.
  - `pg` (optional): Page number for pagination.

  Returns:
  - A string representing the filtered search URL with the specified query parameters.
*/
  const getFilterUrl = ({ c, s, p, r, pg }: { c?: string; s?: string; p?: string; r?: string; pg?: string }) => {
    const params = { q, category, price, rating, sort, page }; // Initializes query parameters with existing values.

    if (c) params.category = c; // Updates category filter if provided.
    if (p) params.price = p; // Updates price filter if provided.
    if (r) params.rating = r; // Updates rating filter if provided.
    if (pg) params.page = pg; // Updates pagination if provided.
    if (s) params.sort = s; // Updates sorting option if provided.

    return `/search?${new URLSearchParams(params).toString()}`; // Converts parameters into a query string and returns the search URL.
  };

  /*
  Retrieves a list of products using the `getAllProducts` function with various filters applied. This query pulls products from the database, applies necessary filters based on search parameters, and returns the filtered results.

  Parameters passed to `getAllProducts`:
  - `category`: The selected category for filtering products. Filters products based on the category value. If `category` is "all", no filter is applied.
  - `query`: A search string used to filter products by name or description. If `q` is "all", no filter is applied.
  - `price`: A price range filter in the format "min-max" (e.g., "1-50", "51-100"). If `price` is "all", no filter is applied.
  - `rating`: A minimum rating filter, used to filter products based on the rating value. If `rating` is "all", no filter is applied.
  - `page`: The current page number, used to paginate the results. It is passed as a number, and the products are fetched accordingly.
  - `sort`: Defines the sorting criteria for the product list. The possible values are:
    - "newest": Sorts by the creation date of the product (latest products first).
    - "lowest": Sorts by price in ascending order.
    - "highest": Sorts by price in descending order.
    - "rating": Sorts by product rating in descending order.

  The function returns a paginated list of products along with the total number of pages based on the filtered product count.

  Example usage:
  - The function fetches the products according to the applied filters (e.g., search query, category, price, rating, sorting) and returns the relevant data for rendering the product list on the page.
*/
  const products = await getAllProducts({
    category,
    query: q,
    price,
    rating,
    page: Number(page),
    sort
  });

  /*
  Retrieves a list of all product categories along with their respective product counts by calling the `getAllCategories` function.

  This function queries the database to retrieve unique product categories and the number of products in each category. It returns an array of objects where each object contains:
  - `category`: The unique name of the product category.
  - `_count`: The total number of products within that category.

  The function does not require any parameters and it is typically used to populate category filters or display a list of categories on the page with the associated product count.

  Example usage:
  - This function is called to get all categories and their product counts, which can then be used to display filters or menus.
*/
  const categories = await getAllCategories();

  return (
    <div className="grid md:grid-cols-5 md:gap-5">
      <div className="filter-links">
        {/* Category Links */}
        <div className="text-xl mt-3 mb-2">Department</div>
        <div>
          <ul className="space-y-1">
            <li>
              {/* Link to show all categories; bold if no specific category is selected */}
              <Link className={`${("all" === category || "" === category) && "font-bold"}`} href={getFilterUrl({ c: "all" })}>
                Any
              </Link>
            </li>
            {/* Loop through categories and generate links for each */}
            {categories.map(x => (
              <li key={x.category}>
                <Link className={`${x.category === category && "font-bold"}`} href={getFilterUrl({ c: x.category })}>
                  {x.category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Price Links */}
        <div>
          <div className="text-xl mt-8 mb-2">Price</div>
          <ul className="space-y-1">
            <li>
              {/* Link to show all price ranges; bold if no specific range is selected */}
              <Link className={`  ${"all" === price && "font-bold"}`} href={getFilterUrl({ p: "all" })}>
                Any
              </Link>
            </li>
            {/* Loop through price ranges and generate links for each */}
            {prices.map(p => (
              <li key={p.value}>
                <Link href={getFilterUrl({ p: p.value })} className={`${p.value === price && "font-bold"}`}>
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Rating Links */}
        <div>
          <div className="text-xl mt-8 mb-2">Customer Review</div>
          <ul className="space-y-1">
            <li>
              {/* Link to show all ratings; bold if no specific rating is selected */}
              <Link href={getFilterUrl({ r: "all" })} className={`  ${"all" === rating && "font-bold"}`}>
                Any
              </Link>
            </li>
            {/* Loop through rating values and generate links for each */}
            {ratings.map(r => (
              <li key={r}>
                <Link href={getFilterUrl({ r: `${r}` })} className={`${r.toString() === rating && "font-bold"}`}>
                  {`${r} stars & up`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="md:col-span-4 space-y-4">
        <div className="flex-between flex-col md:flex-row my-4">
          <div className="flex items-center">
            {/* Display search query if it exists */}
            {q !== "all" && q !== "" && "Query : " + q}
            {/* Display selected category if it's not 'all' */}
            {category !== "all" && category !== "" && "   Category : " + category}
            {/* Display selected price range if it's not 'all' */}
            {price !== "all" && "    Price: " + price}
            {/* Display selected rating if it's not 'all' */}
            {rating !== "all" && "    Rating: " + rating + " & up"}
            &nbsp;
            {/* Render clear filters button only if any filter is active */}
            {(q !== "all" && q !== "") || (category !== "all" && category !== "") || rating !== "all" || price !== "all" ? (
              <Button variant={"link"} asChild>
                <Link href="/search">Clear</Link>
              </Button>
            ) : null}
          </div>
          <div>
            Sort by
            {/* Loop through sorting options and generate links */}
            {sortOrders.map(s => (
              <Link key={s} className={`mx-2   ${sort == s && "font-bold"} `} href={getFilterUrl({ s })}>
                {s}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Show message if no products match the filter criteria */}
          {products!.data.length === 0 && <div>No product found</div>}
          {/* Loop through and display each product */}
          {products!.data.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {/* Render pagination only if there are multiple pages */}
        {products!.totalPages! > 1 && <Pagination page={page} totalPages={products!.totalPages} />}
      </div>
    </div>
  );
};

export default SearchPage;
