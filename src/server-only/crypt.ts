import bcrypt from "bcryptjs";

export const hashPassword = (password: string) => bcrypt.hashSync(password, 10)