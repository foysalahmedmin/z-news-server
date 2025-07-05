import { Document, FilterQuery, Query } from 'mongoose';

class AppQuery<T extends Document> {
  public query: Query<T[], T>;
  public queryParams: Record<string, unknown>;
  public queryFilter: FilterQuery<T>;

  private _page = 1;
  private _limit = 10;

  constructor(query: Query<T[], T>, queryParams: Record<string, unknown>) {
    this.query = query;
    this.queryParams = queryParams;
    this.queryFilter = {};
  }

  search(fields: string[]) {
    const search = this?.queryParams?.search;
    if (search) {
      const searchCondition: FilterQuery<T> = {
        $or: fields.map((field) => ({
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

  filter() {
    const queryObj = { ...this.queryParams };

    const excludeFields = ['search', 'sort', 'limit', 'page', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    this.queryFilter = {
      ...this.queryFilter,
      ...(queryObj as FilterQuery<T>),
    };

    this.query = this.query.find(queryObj as FilterQuery<T>);

    return this;
  }

  sort() {
    const sort =
      (this?.queryParams?.sort as string)?.split(',')?.join(' ') ||
      '-createdAt';
    this.query = this.query.sort(sort);
    return this;
  }

  paginate() {
    this._page = Number(this?.queryParams?.page) || 1;
    this._limit = Number(this?.queryParams?.limit) || 10;
    const skip = (this._page - 1) * this._limit;

    this.query = this.query.skip(skip).limit(this._limit);
    return this;
  }

  fields() {
    const fields =
      (this?.queryParams?.fields as string)?.split(',')?.join(' ') || '-__v';
    this.query = this.query.select(fields);
    return this;
  }

  async execute() {
    const [data, total] = await Promise.all([
      this.query,
      (this.query.model as any).countDocuments(this.queryFilter),
    ]);

    return {
      data,
      meta: {
        total,
        page: this._page,
        limit: this._limit,
      },
    };
  }
}

export default AppQuery;
