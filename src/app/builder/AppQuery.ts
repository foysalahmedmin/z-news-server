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

class AppQuery<T extends Document, R = T> {
  public query: Query<T[], T>;
  public queryParams: QueryParams;
  public queryFilter: FilterQuery<T>;
  private _page: number | null = null;
  private _limit: number | null = null;
  private _lean: boolean | null = null;

  constructor(query: Query<T[], T>, queryParams: Record<string, unknown>) {
    this.query = query;
    this.queryParams = queryParams;
    this.queryFilter = {};
  }

  search(applicableFields: string[]) {
    const search = this?.queryParams?.search;
    if (search) {
      const searchCondition: FilterQuery<T> = {
        $or: applicableFields.map((field) => ({
          [field]: { $regex: search, $options: 'i' },
        })) as FilterQuery<T>[],
      };
      this.queryFilter = {
        ...this.queryFilter,
        ...searchCondition,
      };
      this.query = this.query.find(searchCondition);
    }
    return this;
  }

  filter(applicableFields?: string[]) {
    const queryObj = { ...this.queryParams };
    const excludeFields = [
      'search',
      'sort',
      'limit',
      'page',
      'fields',
      'is_count_only',
    ];
    excludeFields.forEach((el) => delete queryObj[el]);

    if (applicableFields && applicableFields?.length > 0) {
      Object.keys(queryObj).forEach((key) => {
        if (!applicableFields.includes(key)) {
          delete queryObj[key];
        }
      });
    }

    this.queryFilter = {
      ...this.queryFilter,
      ...(queryObj as FilterQuery<T>),
    };
    this.query = this.query.find(queryObj as FilterQuery<T>);
    return this;
  }

  sort(applicableFields?: string[]) {
    const rawSort = (this.queryParams?.sort as string) || '';
    let fields = rawSort.split(',').filter(Boolean);

    if (applicableFields && applicableFields?.length > 0) {
      fields = fields.filter((field) => {
        const plainField = field.startsWith('-') ? field.slice(1) : field;
        return applicableFields.includes(plainField);
      });
    }

    const sortString = fields.length > 0 ? fields.join(' ') : '-createdAt';
    this.query = this.query.sort(sortString);
    return this;
  }

  paginate() {
    const hasLimit = 'limit' in this.queryParams;
    const hasPage = 'page' in this.queryParams;

    if (hasLimit && hasPage) {
      this._page = Number(this.queryParams.page) || 1;
      this._limit = Number(this.queryParams.limit) || 10;
      const skip = (this._page - 1) * this._limit;
      this.query = this.query.skip(skip).limit(this._limit);
    }

    return this;
  }

  fields(applicableFields?: string[]) {
    const rawFields = (this.queryParams?.fields as string) || '';
    let fields = rawFields.split(',').filter(Boolean);

    if (applicableFields && applicableFields?.length > 0) {
      fields = fields.filter((field) => applicableFields.includes(field));
    }

    const parseFields = fields.length > 0 ? fields.join(' ') : '-__v';
    this.query = this.query.select(parseFields);
    return this;
  }

  lean() {
    this._lean = true;
    return this;
  }

  async execute(): Promise<{
    data: R[];
    meta: {
      total: number;
      page: number;
      limit: number;
    };
  }> {
    const isCountOnly = Boolean(this.queryParams.is_count_only);

    if (isCountOnly) {
      const total = await (this.query.model as Model<T>).countDocuments(
        this.queryFilter,
      );

      return {
        data: [],
        meta: {
          total,
          page: this._page ?? 1,
          limit: this._limit ?? 0,
        },
      };
    }

    // Apply lean if requested before executing query
    const queryToExecute = this._lean ? this.query.lean() : this.query;

    const [data, total] = await Promise.all([
      queryToExecute,
      (this.query.model as Model<T>).countDocuments(this.queryFilter),
    ]);

    return {
      data: data as unknown as R[],
      meta: {
        total,
        page: this._page ?? 1,
        limit: this._limit ?? 0,
      },
    };
  }
}

export default AppQuery;
