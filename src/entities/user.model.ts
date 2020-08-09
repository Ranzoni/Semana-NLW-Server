export default interface User extends BaseEntity {
    name: string;
    lastName: string;
    email: string;
    password: string;
    avatar: string;
    whatsapp: string;
    bio: string;
}