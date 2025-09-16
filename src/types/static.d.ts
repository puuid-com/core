declare module "*.crt" {
  const content: string;
  export default content;
}

declare module "*.crt?raw" {
  const content: string;
  export default content;
}
