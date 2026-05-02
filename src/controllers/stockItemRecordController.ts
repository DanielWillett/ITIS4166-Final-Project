import type { Request, Response } from "express";

import * as stockItemRecordService from "../services/stockItemRecordService.js";

import type { StockItemRecordQueryOptions } from "../types/stockItemRecordQueryOptions.js";
import { parseQueryOptions } from "../types/queryOptions.js";

export async function getAllStockItemRecordsHandler(req : Request, res : Response) : Promise<void> {
    const options : StockItemRecordQueryOptions = parseQueryOptions(req)
    const results = await stockItemRecordService.getStockItemRecords(options);
    res.status(200).json(results);
};

export async function getStockItemRecordByIdHandler(req : Request, res : Response) : Promise<void> {
    
    let id = parseInt(req.params.id!.toString());

    const record = await stockItemRecordService.getStockItemRecord(id);
    
    if (!record) {
        res.status(404).json({ error: `Stock Item Record ${id} not found.` });
        return;
    }

    res.status(200).json(record);
};