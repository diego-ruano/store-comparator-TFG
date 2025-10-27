import { chromium } from "playwright";
import fs from "fs";

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto("https://mercadona.es");
    await page.waitForTimeout(2000);

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

        await page.waitForTimeout(1000);

        const subelementos = categoria.locator("ul li");
        const cantidadSub = await subelementos.count();

        if (cantidadSub === 0) {
          continue;
        }

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

                  if (partes.length >= 3) {
                    const nombre = partes[0];
                    const formato = partes[1];
                    const precio = partes[2].replace(" por Unidad", "");

                    fs.appendFileSync(
                      "productos.txt",
                      `${nombre} | ${formato} | ${precio}\n`
                    );
                  }
                }
              } catch (error) {}
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
  } catch (error) {
  } finally {
    await browser.close();
  }
})();
