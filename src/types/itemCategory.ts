export default interface ItemCategory
{
    id: number,
    name: string,
    parent: number | null,
    createdBy: number | null,
    createdAt: Date
};