import { chromium } from "playwright";
import * as fs from "fs/promises";

const scrapping = async () => {
  await fs.rm('./scripts/mercadona/productos_mercadona.json', { force: true }).catch(() => { })
  const results = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto("https://mercadona.es");
    await page.waitForTimeout(1000);

    const botonesCookies = page.locator("div.cookie-banner button");
    if ((await botonesCookies.count()) > 2) {
      await botonesCookies.nth(2).click();
      await page.waitForTimeout(1000);
    }

    await page.fill("div.input-text input", "45270");
    await page.click("input.postal-code-form__button");
    await page.waitForTimeout(1000);

    await page.click("nav.menu a:first-child");
    await page.waitForTimeout(1000);

    const categoriasInicial = page.locator(
      "ul.category-menu li.category-menu__item"
    );
    const cantidadCategorias = await categoriasInicial.count();

    for (let i = 0; i < cantidadCategorias; i++) {
      try {
        const categoriasActual = page.locator(
          "ul.category-menu li.category-menu__item"
        );
        const categoria = categoriasActual.nth(i);

        const boton = categoria
          .locator(
            'button[class*="category-menu__header"], span[class*="category-menu__header"]'
          )
          .first();
        await boton.click();
        await page.waitForTimeout(1500);

        const subelementos = categoria.locator("ul li");
        const cantidadSub = await subelementos.count();
        if (cantidadSub === 0) continue;

        for (let j = 0; j < cantidadSub; j++) {
          try {
            const sub = subelementos.nth(j);
            const subBoton = sub.locator("button, span, a").first();
            await subBoton.hover();
            await page.waitForTimeout(2000);

            const productos = page.locator(
              'div.product-cell button[data-testid="open-product-detail"]'
            );
            const cantidadProductos = await productos.count();

            for (let k = 0; k < cantidadProductos; k++) {
              try {
                const producto = productos.nth(k);
                const ariaLabel = await producto.getAttribute("aria-label");

                if (ariaLabel) {
                  const partes = ariaLabel.split(", ");
                  const imgUrl = await producto.locator('img').getAttribute('src');

                  if (partes.length >= 4) {
                    const price = parseFloat(
                      partes[3].replace(",", ".").replace("€", "").trim()
                    );

                    const temporalObject = {
                      name: partes[0].trim(),
                      url_image: imgUrl,
                      price,
                      retailer: 'Mercadona',
                    };
                    if (temporalObject.name != null && temporalObject.url_image != null && temporalObject.price != null) {
                      results.push(temporalObject);
                    }
                  }
                }
              } catch (error) {
              }
            }

            await page.waitForTimeout(500);
          } catch (error) {
            continue;
          }
        }

        await page.waitForTimeout(1000);
      } catch (error) {
        continue;
      }
    }

    await fs.writeFile(
      './scripts/mercadona/productos_mercadona.json',
      JSON.stringify(results, null, 2),
      'utf-8'
    );

  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
};

export default scrapping;
