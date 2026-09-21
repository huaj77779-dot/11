import catalog from "../data/cufflinks-catalog.json";
import broochCatalogData from "../data/brooch-catalog.json";
import tiePinCatalogData from "../data/tie-pin-catalog.json";

export type CatalogPriceTier = { minQuantity: number; unitPrice: number };
export type CatalogSku = {
  skuId: string;
  attributes: Array<{ name: string; value: string }>;
  imageUrl: string | null;
  imageFallback: boolean;
  sourceColor: string;
  colorGroup: string;
  sourceMaterial: string;
  materialGroup: string;
  styleGroup: string;
  stockQuantity: number | null;
  stockStatus: string;
  priceTiers: CatalogPriceTier[];
};
export type CatalogProduct = Omit<(typeof catalog.products)[number], "skus"> & { skus: CatalogSku[] };

export const cufflinkCatalog = catalog.products as CatalogProduct[];
export const accessoryCatalog = [
  ...cufflinkCatalog,
  ...(broochCatalogData.products as CatalogProduct[]),
  ...(tiePinCatalogData.products as CatalogProduct[]),
];
export const cufflinkCatalogMeta = { generatedAt: catalog.generatedAt, markup: catalog.markup };

export function getCufflinkProduct(productId: number) {
  return accessoryCatalog.find((product) => product.id === productId);
}
