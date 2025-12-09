import crypto from "crypto"

export function createWallet() :string{
     const num = crypto.randomInt(10_000_000_000, 99_999_999_999).toString();
     return num 
}