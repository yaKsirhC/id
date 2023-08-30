export type IUser = {
    _id: string,
    identifier: string,
    token: string,
    admin: boolean,
    balance: number,
    account_username: string,
    createdAt: Date,
}

export type ContextData = {
    user: IUser | null;
    removeBalance: (amount: number) => void;
}