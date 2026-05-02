import type { Request, Response } from "express";

import * as categoryService from "../services/itemCategoryService.js";

import type { ItemCategoryQueryOptions } from "../types/itemCategoryQueryOptions.js";
import { parseQueryOptions } from "../types/queryOptions.js";
import type { CategoryUpdateParameters } from "../repositories/itemCategoryRepo.js";
import HttpError from "../errors/NotFoundError.js";

export async function getAllCategoriesHandler(req : Request, res : Response) : Promise<void> {
    const options : ItemCategoryQueryOptions = parseQueryOptions(req)
    const results = await categoryService.getCategories(options);
    res.status(200).json(results);
};

export async function getCategoryByIdHandler(req : Request, res : Response) : Promise<void> {
    
    let id = parseInt(req.params.id!.toString());

    const category = await categoryService.getCategory(id);
    
    if (!category) {
        res.status(404).json({ error: `Item category ${id} not found.` });
        return;
    }

    res.status(200).json(category);
};

export async function createCategoryHandler(req : Request, res : Response) : Promise<void> {
    
    let parentId : number | null = parseInt(req.body.parent);
    if (isNaN(parentId)) parentId = null;
    
    const newCategory = await categoryService.createCategory({
        name: req.body.name,
        parent: parentId,
        createdAt: new Date(Date.now()),
        createdBy: req.session?.user.id ?? null,
        id: -1
    });

    res.status(201).json(newCategory);
};

export async function updateCategoryHandler(req : Request, res : Response) : Promise<void> {
    const id = parseInt(req.params.id!.toString());

    if (req.session?.user.role !== "admin") {
        const originalCategory = await categoryService.getCategory(id);
        if (!originalCategory) {
            res.status(404).json({ error: `Item category ${id} not found.` });
            return;
        }

        if (originalCategory.createdBy !== req.session?.user.id) {
            throw new HttpError("Unauthorized, requires administrator access or ownership of resource.", 403);
        }
    }
    
    let update : CategoryUpdateParameters = { name: undefined, parent: undefined };
    if (req.body.name) {
        update.name = req.body.name;
    }

    if (req.body.parent !== undefined) {
        update.parent = req.body.parent === null ? null : parseInt(req.body.parent);
    }

    const category = await categoryService.updateCategory(id, update);
    if (!category) {
        res.status(404).json({ error: `Item category ${id} not found.` });
        return;
    }
    
    res.status(200).json(category);
};

export async function deleteCategoryHandler(req : Request, res : Response) : Promise<void> {
    const id = parseInt(req.params.id!.toString());

    if (req.session?.user.role !== "admin") {
        const originalCategory = await categoryService.getCategory(id);
        if (!originalCategory) {
            res.status(404).json({ error: `Item category ${id} not found.` });
            return;
        }

        if (originalCategory?.createdBy !== req.session?.user.id) {
            throw new HttpError("Unauthorized, requires administrator access or ownership of resource.", 403);
        }
    }

    const success = await categoryService.deleteCategory(id);
    if (!success) {
        res.status(404).json({ error: `Item category ${id} not found.` });
        return;
    }

    res.status(204).send();
};