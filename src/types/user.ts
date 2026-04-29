export default interface User
{
    id: number,
    firstName: string,
    lastName: string,
    username: string,
    createdById: number | null,
    createdAt: Date,
    role: "read" | "write" | "admin"
};