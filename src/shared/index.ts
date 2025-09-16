import ky from "ky";

export const lolClient = () => ky.create();
