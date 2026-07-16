import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 1. Open the generator page
        await page.goto("http://localhost:3000")
        await page.wait_for_selector("#user")

        # 2. Fill the username & repos
        await page.fill("#user", "vercel")
        await page.fill("#repos", "next.js, turborepo")

        # 3. Choose dynamic sizing
        await page.fill("#width", "450")
        await page.fill("#height", "140")

        # 4. Generate SVG
        await page.click("button.btn")
        await page.wait_for_selector(".preview img")
        await page.wait_for_timeout(3000)

        # Save a screenshot to verify custom wide cards
        await page.screenshot(path="/home/jules/verification/custom_wide_cards.png", full_page=True)

        # 5. Let's try custom narrow tall cards
        await page.fill("#width", "250")
        await page.fill("#height", "180")
        await page.click("button.btn")
        await page.wait_for_timeout(3000)
        await page.screenshot(path="/home/jules/verification/custom_narrow_tall_cards.png", full_page=True)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
