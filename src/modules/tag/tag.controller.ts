import { Request, Response, NextFunction } from 'express';
import * as tagService from './tag.service';
import { sendSuccess } from '../../utils/response';

export const listTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await tagService.listTags();
    sendSuccess(res, tags);
  } catch (error) {
    next(error);
  }
};

export const getArticlesByTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tag, data, meta } = await tagService.getArticlesByTag(req.params.slug as string, req.query);
    // Combine to match standard response, data holds articles, meta holds pagination, and we can add tag info
    sendSuccess(res, { tag, articles: data }, meta);
  } catch (error) {
    next(error);
  }
};
