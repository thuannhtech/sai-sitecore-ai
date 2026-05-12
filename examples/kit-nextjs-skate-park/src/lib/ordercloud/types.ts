
export type RegisterUserRequest = {
    Username: string;
    Password: string;
    FirstName: string;
    LastName: string;
    Email: string;
    xp: { AccountType: string; }
}