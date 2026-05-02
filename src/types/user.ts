export default interface User
{
    id: number,
    firstName: string,
    lastName: string,
    username: string,
    createdBy: number | null,
    createdAt: Date,
    role: "read" | "write" | "admin"
};