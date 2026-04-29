import type { NextFunction, Request, Response } from "express";

import * as categoryService from "../services/itemCategoryService.js";

import type { ItemCategoryQueryOptions } from "../types/itemCategoryQueryOptions.js";

export async function getAllCategoriesHandler(req : Request, res : Response) : Promise<void> {
    const options : ItemCategoryQueryOptions = parseQueryOptions(req)
    const results = await categoryService.getCategories(options);
    res.status(200).json(results);
};

export async function createCategoryHandler(req : Request, res : Response) : Promise<void> {

};

export async function getCategoryByIdHandler(req : Request, res : Response) : Promise<void> {

};

export async function updateCategoryHandler(req : Request, res : Response) : Promise<void> {

};

export async function deleteCategoryHandler(req : Request, res : Response) : Promise<void> {

};