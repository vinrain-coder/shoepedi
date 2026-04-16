export { createProduct, updateProduct, deleteProduct } from "./product/crud.service";
export {
  getProductById,
  getProductsByIds,
  getProductBySlug,
  getProductsByTag,
  getProductsByCategory,
} from "./product/query-read.service";
export { getRelatedProductsByCategory, getAllProducts } from "./product/query-list.service";
export { getAllProductsForAdmin } from "./product/admin-list.service";
export {
  getProductAdminStats,
  getProductsForCard,
  getAllCategories,
} from "./product/admin-insights.service";
export {
  getAllTags,
  getAllTagsForAdminProductCreate,
  getAllBrands,
  getAllColors,
  getAllSizes,
} from "./product/facets.service";
