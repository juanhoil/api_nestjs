import {
    Controller, Get, HttpStatus, Param, Res
} from '@nestjs/common';
import { Response } from 'express';
import { get } from 'lodash';
import { ObjectId } from 'mongodb';
import { defaultPaginate } from 'nestjs-mongoose-crud';
import {
    CrudQuery,
    ICrudQuery
} from 'nestjs-mongoose-crud/dist/crud-query.decorator';
import { PaginateKeys } from 'nestjs-mongoose-crud/dist/crud.interface';
import { UniqueActionService } from '../uniqueaction/uniqueaction.service';
import { VirtualService } from './virtual.service';

@Controller('/users')
export class VirtualController {
  crudOptions = {};

  public constructor(
    private readonly virtualService: VirtualService,
    public uniqueActionService: UniqueActionService,
  ) {}

  @Get('gallery/:customerID')
  async getSampleVirtualsWithUniqueAction(
    @Res() response: Response,
    @Param('customerID') customerID: string,
    @CrudQuery('query') query: ICrudQuery = {},
  ) {
    if (!query.where)
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: `missing params. where is required` });
    let {
      where = get(this.crudOptions, 'routes.find.where', {}),
      limit = get(this.crudOptions, 'routes.find.limit', 10),
      select = get(this.crudOptions, 'routes.find.select', undefined),
      //sort = get(this.crudOptions, "routes.find.sort", undefined),
      page = 1,
      skip = 0,
    } = query;
    if (skip < 1) {
      skip = (page - 1) * limit;
    }
    const paginateKeys: PaginateKeys | false = get(
      this.crudOptions,
      'routes.find.paginate',
      defaultPaginate,
    );
    const projectSelect = select.reduce((a, v) => ({ ...a, [v]: 1 }), {});
    const total = await this.virtualService.model.countDocuments(where);
    if (where.preferences && where.preferences['$in']) {
      const idsPrefereces = where.preferences['$in'].map(
        (v) => new ObjectId(v),
      );
      where.preferences['$in'] = idsPrefereces;
    }

    const data = await this.virtualService.model.aggregate([
      {
        $match: where,
      },
      { $skip: skip },
      {
        $sample: {
          size: limit,
        },
      },
      {
        $project: projectSelect,
      },
    ]);    

    if (paginateKeys !== false) {
      let res: any = [];

      if (data) {
        for (const [i, v] of data.entries()) {
          let virtualID = new ObjectId(v._id).toString();
          let select: any = ['type'];
          let where: any = { virtual: virtualID, customer: customerID };

          let getOtherAction = await this.uniqueActionService.getAllByVirtual(
            where,
            select,
          );

          //v. .concat(getOtherAction);

          getOtherAction['virtual'] = v;

          res.push(getOtherAction);
        }
      }
      return response.status(HttpStatus.OK).json({
        total: total,
        data: res,
        lastPage: Math.ceil(total / limit),
        currentPage: page,
      });
    }
  }

  @Get('profile/:customerID')
  async findVirtuanAndUniqueAction(
    @Res() res: Response,
    @Param('customerID') customerID: string,
    @CrudQuery('query') query: ICrudQuery = {},
  ) {
    if (!query.where)
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: `missing params. where is required` });
    let {
      where = get(this.crudOptions, 'routes.find.where', {}),
      limit = get(this.crudOptions, 'routes.find.limit', 10),
      select = get(this.crudOptions, 'routes.find.select', undefined),
      page = 1,
      skip = 0,
      populate = get(this.crudOptions, 'routes.find.populate', undefined),
      sort = get(this.crudOptions, 'routes.find.sort', undefined),
      collation = undefined,
    } = query;

    if (skip < 1) {
      skip = (page - 1) * limit;
    }

    const paginateKeys: PaginateKeys | false = get(
      this.crudOptions,
      'routes.find.paginate',
      defaultPaginate,
    );

    const find = async () => {
      const data = await this.virtualService.model
        .find()
        .where(where)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .select(select)
        .populate(populate)
        .collation(collation);
      if (paginateKeys !== false) {
        let res: any = [];

        if (data) {
          for (const [i, v] of data.entries()) {
            let virtualID = new ObjectId(v._id).toString();
            let select: any = ['type'];
            let where: any = { virtual: virtualID, customer: customerID };

            let getOtherAction = await this.uniqueActionService.getAllByVirtual(
              where,
              select,
            );

            //v. .concat(getOtherAction);

            getOtherAction['virtual'] = v;

            res.push(getOtherAction);
          }
        }

        const total = await this.virtualService.model.countDocuments(where);
        return {
          [paginateKeys.total]: total,
          [paginateKeys.data]: res,
          [paginateKeys.lastPage]: Math.ceil(total / limit),
          [paginateKeys.currentPage]: page,
        };
      }
      return data;
    };
    let result = await find()
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('/tinder/:customerID')
  async findOneActionSample(@Param('customerID') customerID: string, @CrudQuery("query") query: ICrudQuery = {}) {
      let {
        where = get(this.crudOptions, "routes.find.where", {}),
        limit = get(this.crudOptions, "routes.find.limit", 10),
        select = get(this.crudOptions, "routes.find.select", undefined),
        page = 1,
        skip = 0,
      } = query;
      const projectSelect = select.reduce((a, v) => ({ ...a, [v]: 1 }), {});
      const total = await this.virtualService.model.countDocuments(where);
      const data = await this.virtualService.model.aggregate([
        {
          $match: where
        },
        { $skip: skip },
        {
          $sample: {
            size: limit
          }
        },
        {
          $project: projectSelect
        },
      ]);
      return {
        total: total,
        data: data,
        lastPage: Math.ceil(total / limit),
        currentPage: page,
      }
  }

}
