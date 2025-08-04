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

type LeanOptions =
  | boolean
  | {
      virtuals?: boolean;
      getters?: boolean;
      defaults?: boolean;
    };

class AppQuery<T extends Document, R = T> {
  public query: Query<T[], T>;
  public queryParams: QueryParams;
  public queryFilter: FilterQuery<T>;
  private _page: number | null = null;
  private _limit: number | null = null;
  private _lean = false;
  private _leanArguments: [LeanOptions?] = [];

  constructor(query: Query<T[], T>, queryParams: Record<string, unknown>) {
    this.query = query;
    this.queryParams = queryParams;
    this.queryFilter = {};
  }

  search(applicableFields: string[]) {
    const search = this.queryParams?.search;
    if (search) {
      const searchCondition: FilterQuery<T> = {
        $or: applicableFields.map((field) => ({
          [field]: { $regex: search, $options: 'i' },
        })) as FilterQuery<T>[],
      };
      this.queryFilter = { ...this.queryFilter, ...searchCondition };
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

    if (applicableFields?.length) {
      Object.keys(queryObj).forEach((key) => {
        if (!applicableFields.includes(key)) {
          delete queryObj[key];
        }
      });
    }

    this.queryFilter = { ...this.queryFilter, ...(queryObj as FilterQuery<T>) };
    this.query = this.query.find(queryObj as FilterQuery<T>);
    return this;
  }

  sort(applicableFields?: string[]) {
    const rawSort = (this.queryParams?.sort as string) || '';
    let fields = rawSort.split(',').filter(Boolean);

    if (applicableFields?.length) {
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

    if (applicableFields?.length) {
      fields = fields.filter((field) => {
        const cleanField = field.startsWith('-') ? field.slice(1) : field;
        return applicableFields.includes(cleanField);
      });
    }

    const parseFields =
      fields.length > 0
        ? fields.join(' ')
        : applicableFields?.join(' ') || '-__v';
    this.query = this.query.select(parseFields);
    return this;
  }

  lean(options?: LeanOptions) {
    this._lean = true;
    this._leanArguments = options !== undefined ? [options] : [];
    return this;
  }

  async execute(): Promise<{
    data: R[];
    meta: { total: number; page: number; limit: number };
  }> {
    if (Boolean(this.queryParams.is_count_only)) {
      const total = await (this.query.model as Model<T>).countDocuments(
        this.queryFilter,
      );
      return {
        data: [],
        meta: { total, page: this._page ?? 1, limit: this._limit ?? 0 },
      };
    }

    const queryToExecute = this._lean
      ? this.query.lean(...this._leanArguments)
      : this.query;

    const [data, total] = await Promise.all([
      queryToExecute,
      (this.query.model as Model<T>).countDocuments(this.queryFilter),
    ]);

    return {
      data: data as unknown as R[],
      meta: { total, page: this._page ?? 1, limit: this._limit ?? 0 },
    };
  }
}

export default AppQuery;
