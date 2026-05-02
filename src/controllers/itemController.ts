import type { Request, Response } from "express";

import * as itemService from "../services/itemService.js";

import type { ItemQueryOptions } from "../types/itemQueryOptions.js";
import { parseQueryOptions } from "../types/queryOptions.js";
import type { ItemUpdateParameters } from "../repositories/itemRepo.js";
import HttpError from "../errors/NotFoundError.js";

export async function getAllItemsHandler(req : Request, res : Response) : Promise<void> {
    const options : ItemQueryOptions = parseQueryOptions(req)
    const results = await itemService.getItems(options);
    res.status(200).json(results);
};

export async function getItemByIdHandler(req : Request, res : Response) : Promise<void> {
    
    let id = parseInt(req.params.id!.toString());

    const item = await itemService.getItem(id);
   
    if (!item) {
        res.status(404).json({ error: `Item ${id} not found.` });
        return;
    }

    res.status(200).json(item);
};

export async function createItemHandler(req : Request, res : Response) : Promise<void> {
    
    const newItem = await itemService.createItem({
        name: req.body.name,
        description: req.body.description,
        category: parseInt(req.body.category),
        createdAt: new Date(Date.now()),
        createdBy: req.session?.user.id ?? null,
        id: -1
    });

    res.status(201).json(newItem);
};

export async function updateItemHandler(req : Request, res : Response) : Promise<void> {
    const id = parseInt(req.params.id!.toString());

    if (req.session?.user.role !== "admin") {
        const originalItem = await itemService.getItem(id);
        if (!originalItem) {
            res.status(404).json({ error: `Item ${id} not found.` });
            return;
        }

        if (originalItem.createdBy !== req.session?.user.id) {
            throw new HttpError("Unauthorized, requires administrator access or ownership of resource.", 403);
        }
    }
    
    let update : ItemUpdateParameters = { name: undefined, description: undefined, category: undefined };
    if (req.body.name) {
        update.name = req.body.name;
    }
    if (req.body.description) {
        update.description = req.body.description;
    }
    if (req.body.category !== undefined) {
        update.category = parseInt(req.body.category);
    }

    const item = await itemService.updateItem(id, update);
    if (!item) {
        res.status(404).json({ error: `Item ${id} not found.` });
        return;
    }
    
    res.status(200).json(item);
};

export async function deleteItemHandler(req : Request, res : Response) : Promise<void> {
    const id = parseInt(req.params.id!.toString());

    if (req.session?.user.role !== "admin") {
        const originalItem = await itemService.getItem(id);
        if (!originalItem) {
            res.status(404).json({ error: `Item ${id} not found.` });
            return;
        }

        if (originalItem?.createdBy !== req.session?.user.id) {
            throw new HttpError("Unauthorized, requires administrator access or ownership of resource.", 403);
        }
    }

    const success = await itemService.deleteItem(id);
    if (!success) {
        res.status(404).json({ error: `Item ${id} not found.` });
        return;
    }

    res.status(204).send();
};