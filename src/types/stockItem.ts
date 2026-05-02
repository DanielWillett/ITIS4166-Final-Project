export default interface StockItem
{
    id: number,
    item: number,
    quantity: number,
    manufacturer: string | null,
    vendor: string | null,
    url: string | null,
    location: string,
    createdBy: number | null,
    createdAt: Date
};