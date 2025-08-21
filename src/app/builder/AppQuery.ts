import { Document, FilterQuery, Model, Query } from 'mongoose';

interface QueryParams {
  search?: string;
  sort?: string;
  page?: string;
  limit?: string;
  fields?: string;
  is_count_only?: string | boolean;
  [key: string]: unknown;
}

// Internal type to extend the result type with Document properties
type DocumentType<T> = T & Document;

class AppQuery<T = any> {
  public query: Query<DocumentType<T>[], DocumentType<T>>;
  public queryParams: QueryParams;
  public queryFilter: FilterQuery<DocumentType<T>>;
  private pageNumber = 1;
  private pageLimit = 0;

  constructor(
    query: Query<DocumentType<T>[], DocumentType<T>>,
    queryParams: Record<string, unknown>,
  ) {
    this.query = query;
    this.queryParams = queryParams;
    this.queryFilter = {};
  }

  search(applicableFields: (keyof T)[]): this {
    const searchValue = this.queryParams.search;
    if (searchValue) {
      const searchConditions: FilterQuery<DocumentType<T>> = {
        $or: applicableFields.map((field) => ({
          [field]: { $regex: searchValue, $options: 'i' },
        })) as FilterQuery<DocumentType<T>>[],
      };
      this.queryFilter = { ...this.queryFilter, ...searchConditions };
      this.query = this.query.find(searchConditions);
    }
    return this;
  }

  filter(applicableFields?: (keyof T)[]): this {
    const queryObj = { ...this.queryParams };
    const excludedFields = [
      'search',
      'sort',
      'limit',
      'page',
      'fields',
      'is_count_only',
    ];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Normal filter
    if (applicableFields?.length) {
      Object.keys(queryObj).forEach((key) => {
        if (!applicableFields.includes(key as keyof T)) {
          delete queryObj[key];
        }
      });
    }

    const mongoFilter: Record<string, any> = {};

    // Handle OR
    if (queryObj.or) {
      try {
        mongoFilter.$or = Object.values(queryObj.or).map((cond: any) => cond);
      } catch (e) {
        console.error('Invalid OR format:', e);
      }
      delete queryObj.or;
    }

    // Handle AND
    if (queryObj.and) {
      try {
        mongoFilter.$and = Object.values(queryObj.and).map((cond: any) => cond);
      } catch (e) {
        console.error('Invalid AND format:', e);
      }
      delete queryObj.and;
    }

    // Merge remaining normal filters
    Object.assign(mongoFilter, queryObj);

    // Apply to query
    this.queryFilter = { ...this.queryFilter, ...mongoFilter };
    this.query = this.query.find(mongoFilter);

    return this;
  }

  sort(applicableFields?: (keyof T)[]): this {
    const rawSort = this.queryParams.sort ?? '';
    let fields = rawSort.split(',').filter(Boolean);

    if (applicableFields?.length) {
      fields = fields.filter((field) => {
        const fieldName = field.startsWith('-') ? field.slice(1) : field;
        return applicableFields.includes(fieldName as keyof T);
      });
    }

    const sortOrder = fields.length > 0 ? fields.join(' ') : '-createdAt';
    this.query = this.query.sort(sortOrder);
    return this;
  }

  paginate(): this {
    const { page, limit } = this.queryParams;

    if (limit && page) {
      this.pageNumber = Number(page) || 1;
      this.pageLimit = Number(limit) || 10;
      const skip = (this.pageNumber - 1) * this.pageLimit;
      this.query = this.query.skip(skip).limit(this.pageLimit);
    }

    return this;
  }

  fields(applicableFields?: (keyof T)[]): this {
    const rawFields = this.queryParams.fields ?? '';
    let selectedFields = rawFields.split(',').filter(Boolean);

    if (applicableFields?.length) {
      selectedFields = selectedFields.filter((field) => {
        const fieldName = field.startsWith('-') ? field.slice(1) : field;
        return applicableFields.includes(fieldName as keyof T);
      });
    }

    const fieldSelection =
      selectedFields.length > 0
        ? selectedFields.join(' ')
        : (applicableFields?.join(' ') ?? '-__v');

    this.query = this.query.select(fieldSelection);
    return this;
  }

  tap(
    callback: (
      query: Query<DocumentType<T>[], DocumentType<T>>,
    ) => Query<any, DocumentType<T>>,
  ): this {
    this.query = callback(this.query) as Query<
      DocumentType<T>[],
      DocumentType<T>
    >;
    return this;
  }

  async execute(
    statisticsQueries?: { key: string; filter: Record<string, any> }[],
  ): Promise<{
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      statistics?: Record<string, number>;
    };
  }> {
    if (Boolean(this.queryParams.is_count_only)) {
      const total = await (
        this.query.model as Model<DocumentType<T>>
      ).countDocuments(this.queryFilter);

      return {
        data: [],
        meta: { total, page: this.pageNumber, limit: this.pageLimit },
      };
    }

    const [data, total, stats] = await Promise.all([
      this.query,
      (this.query.model as Model<DocumentType<T>>).countDocuments(
        this.queryFilter,
      ),
      statisticsQueries
        ? Promise.all(
            statisticsQueries.map(async (stat) => {
              const count = await (
                this.query.model as Model<DocumentType<T>>
              ).countDocuments({
                ...this.queryFilter,
                ...stat.filter,
              });
              return { key: stat.key, count };
            }),
          )
        : Promise.resolve([]),
    ]);

    const statistics =
      stats?.reduce(
        (acc, curr) => {
          acc[curr.key] = curr.count;
          return acc;
        },
        {} as Record<string, number>,
      ) || undefined;

    return {
      data: data as unknown as T[],
      meta: { total, page: this.pageNumber, limit: this.pageLimit, statistics },
    };
  }
}

export default AppQuery;
