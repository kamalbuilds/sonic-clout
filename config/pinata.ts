import { PinataSDK } from "pinata";

const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT!;
const pinataGateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY!;

export const pinata = new PinataSDK({
    pinataJwt: pinataJwt,
    pinataGateway: pinataGateway,
});