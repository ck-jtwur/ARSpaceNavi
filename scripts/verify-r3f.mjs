import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:5186";

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: "chrome" });
  } catch {
    return chromium.launch();
  }
}

const browser = await launchBrowser();

async function verifyViewport(name, viewport, deviceScaleFactor) {
  const page = await browser.newPage({ viewport, deviceScaleFactor });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".virtual-sky canvas");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `r3f-sky-${name}.png`, fullPage: true });

  const result = await page.evaluate(() => {
    const canvas = document.querySelector(".virtual-sky canvas");
    if (!(canvas instanceof HTMLCanvasElement)) {
      return { ok: false, reason: "canvas missing", brightPixels: 0, width: 0, height: 0 };
    }

    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) {
      return { ok: false, reason: "webgl missing", brightPixels: 0, width: canvas.width, height: canvas.height };
    }

    const width = canvas.width;
    const height = canvas.height;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    let brightPixels = 0;
    for (let index = 0; index < pixels.length; index += 4 * 17) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      if (red + green + blue > 90) {
        brightPixels += 1;
      }
    }

    return {
      ok: brightPixels > 20,
      reason: brightPixels > 20 ? "nonblank" : "too few bright pixels",
      brightPixels,
      width,
      height,
    };
  });

  await page.close();
  return { name, ...result };
}

const results = [
  await verifyViewport("mobile", { width: 390, height: 844 }, 2),
  await verifyViewport("desktop", { width: 1280, height: 800 }, 1),
];

await browser.close();

console.log(JSON.stringify(results, null, 2));
if (results.some((result) => !result.ok)) {
  process.exitCode = 1;
}
