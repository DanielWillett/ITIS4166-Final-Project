export default interface ItemCategory
{
    id: number,
    name: string,
    parentId: number | null,
    createdById: number | null,
    createdAt: Date
};