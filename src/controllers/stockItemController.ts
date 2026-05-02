import type { Request, Response } from "express";

import * as stockItemService from "../services/stockItemService.js";

import type { StockItemQueryOptions } from "../types/stockItemQueryOptions.js";
import { parseQueryOptions } from "../types/queryOptions.js";
import type { StockItemUpdateParameters } from "../repositories/stockItemRepo.js";
import HttpError from "../errors/NotFoundError.js";

export async function getAllStockItemsHandler(req : Request, res : Response) : Promise<void> {
    const options : StockItemQueryOptions = parseQueryOptions(req)
    const results = await stockItemService.getStockItems(options);
    res.status(200).json(results);
};

export async function getStockItemByIdHandler(req : Request, res : Response) : Promise<void> {
    
    let id = parseInt(req.params.id!.toString());

    const stockItem = await stockItemService.getStockItem(id);
    
    if (!stockItem) {
        res.status(404).json({ error: `Stock Item ${id} not found.` });
        return;
    }

    res.status(200).json(stockItem);
};

export async function createStockItemHandler(req : Request, res : Response) : Promise<void> {
    
    const newItem = await stockItemService.createStockItem({
        item: parseInt(req.body.item),
        quantity: parseFloat(req.body.quantity),
        manufacturer: req.body.manufacturer,
        vendor: req.body.vendor,
        url: req.body.url,
        location: req.body.location,
        createdAt: new Date(Date.now()),
        createdBy: req.session?.user.id ?? null,
        id: -1
    }, req.session?.user.id);

    res.status(201).json(newItem);
};

export async function updateStockItemHandler(req : Request, res : Response) : Promise<void> {
    const id = parseInt(req.params.id!.toString());

    if (req.session?.user.role !== "admin") {
        const originalItem = await stockItemService.getStockItem(id);
        if (!originalItem) {
            res.status(404).json({ error: `Stock Item ${id} not found.` });
            return;
        }

        if (originalItem.createdBy !== req.session?.user.id) {
            throw new HttpError("Unauthorized, requires administrator access or ownership of resource.", 403);
        }
    }
    
    let update : StockItemUpdateParameters = { quantity: undefined, manufacturer: undefined, vendor: undefined, url: undefined, location: undefined };
    
    if (req.body.quantity !== undefined) {
        update.quantity = parseFloat(req.body.quantity);
    }
    if (req.body.manufacturer !== undefined) {
        update.manufacturer = req.body.manufacturer;
    }
    if (req.body.vendor !== undefined) {
        update.vendor = req.body.vendor;
    }
    if (req.body.url !== undefined) {
        update.url = req.body.url;
    }
    if (req.body.location) {
        update.location = req.body.location;
    }

    const item = await stockItemService.updateStockItem(id, update, req.session?.user.id);
    if (!item) {
        res.status(404).json({ error: `Stock Item ${id} not found.` });
        return;
    }
    
    res.status(200).json(item);
};

export async function deleteStockItemHandler(req : Request, res : Response) : Promise<void> {
    const id = parseInt(req.params.id!.toString());

    if (req.session?.user.role !== "admin") {
        const originalItem = await stockItemService.getStockItem(id);
        if (!originalItem) {
            res.status(404).json({ error: `Stock Item ${id} not found.` });
            return;
        }

        if (originalItem?.createdBy !== req.session?.user.id) {
            throw new HttpError("Unauthorized, requires administrator access or ownership of resource.", 403);
        }
    }

    const success = await stockItemService.deleteStockItem(id);
    if (!success) {
        res.status(404).json({ error: `Stock Item ${id} not found.` });
        return;
    }

    res.status(204).send();
};