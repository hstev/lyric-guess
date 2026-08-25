import { createMemoryCatalog } from '../repositories/create-catalog';

let catalog = createMemoryCatalog();

export function getStaticCatalog() {
  return catalog;
}

export function setStaticCatalogForTests(next: ReturnType<typeof createMemoryCatalog>): void {
  catalog = next;
}
