export default interface Item
{
    id: number,
    name: string,
    description: string,
    createdBy: number | null,
    createdAt: Date,
    category: number
};