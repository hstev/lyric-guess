import type { Database } from 'sql.js';
import type { Category } from '../../types/catalog';
import { all, get } from '../database/sql';
import { mapCategoryRow } from './mappers';
import type { CategoryRepository } from './types';

export class SqliteCategoryRepository implements CategoryRepository {
  constructor(private readonly db: Database) {}

  async getCategories(): Promise<Category[]> {
    return all(this.db, 'SELECT id, name, slug FROM categories ORDER BY name COLLATE NOCASE').map(
      mapCategoryRow,
    );
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const row = get(this.db, 'SELECT id, name, slug FROM categories WHERE slug = ?', [slug]);
    return row ? mapCategoryRow(row) : null;
  }
}
