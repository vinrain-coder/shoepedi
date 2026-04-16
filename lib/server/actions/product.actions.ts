"use server";

import * as productService from "@/lib/server/services/product.service";

export const createProduct = productService.createProduct;
export const updateProduct = productService.updateProduct;
export const deleteProduct = productService.deleteProduct;
export const getProductById = productService.getProductById;
export const getProductsByIds = productService.getProductsByIds;
export const getAllProductsForAdmin = productService.getAllProductsForAdmin;
export const getProductAdminStats = productService.getProductAdminStats;
export const getAllCategories = productService.getAllCategories;
export const getProductsForCard = productService.getProductsForCard;
export const getProductsByTag = productService.getProductsByTag;
export const getProductBySlug = productService.getProductBySlug;
export const getRelatedProductsByCategory = productService.getRelatedProductsByCategory;
export const getAllProducts = productService.getAllProducts;
export const getAllTags = productService.getAllTags;
export const getAllTagsForAdminProductCreate = productService.getAllTagsForAdminProductCreate;
export const getAllBrands = productService.getAllBrands;
export const getAllColors = productService.getAllColors;
export const getAllSizes = productService.getAllSizes;
export const getProductsByCategory = productService.getProductsByCategory;
