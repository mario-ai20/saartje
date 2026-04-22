import path from "path";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "public", "intro-assets", "saartje kalebassen.jpg");
const output = path.join(root, "public", "intro-assets", "saartje-desktop-icon.png");

const image = sharp(source);
const metadata = await image.metadata();
const size = Math.max(metadata.width ?? 1024, metadata.height ?? 1024, 1024);

await image
  .resize(size, size, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(output);
