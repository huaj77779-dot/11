import catalog from "../data/cufflinks-catalog.json";
import broochCatalogData from "../data/brooch-catalog.json";
import tiePinCatalogData from "../data/tie-pin-catalog.json";
import pocketSquareCatalogData from "../data/pocket-square-catalog.json";
import tieClipCatalogData from "../data/tie-clip-catalog.json";

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
  ...(pocketSquareCatalogData.products as CatalogProduct[]),
  ...(tieClipCatalogData.products as CatalogProduct[]),
];
export const cufflinkCatalogMeta = { generatedAt: catalog.generatedAt, markup: catalog.markup };

export function getCufflinkProduct(productId: number) {
  return accessoryCatalog.find((product) => product.id === productId);
}
