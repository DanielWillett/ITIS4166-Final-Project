export default interface StockItemRecord
{
    id: number,
    stockItem: number,
    fieldId: number,
    description: string,
    oldValue: string,
    user: number | null,
    timestamp: Date
};