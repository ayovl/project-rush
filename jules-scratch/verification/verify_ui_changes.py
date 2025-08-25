from playwright.sync_api import Page, expect

def verify_changes(page: Page):
    """
    This script verifies the UI changes made to the demo and pricing pages.
    """
    # Verify Demo Page
    print("Navigating to demo page...")
    page.goto("http://localhost:3000/demo")
    page.wait_for_load_state("networkidle")

    print("Taking a debug screenshot...")
    page.screenshot(path="jules-scratch/verification/debug.png")

    # Open aspect ratio selector
    print("Opening aspect ratio selector...")
    # The button contains a span with the text "Portrait"
    aspect_ratio_button = page.locator("button", has_text="Portrait")
    aspect_ratio_button.click()

    # Wait for the dropdown to be visible
    expect(page.locator("div.z-50.w-44")).to_be_visible()

    print("Taking screenshot of demo page with aspect ratio selector open...")
    page.screenshot(path="jules-scratch/verification/demo_page.png")

    # Verify Pricing Page
    print("Navigating to pricing page...")
    page.goto("http://localhost:3000/pricing")
    page.wait_for_load_state("networkidle")

    # Wait for the page to load
    expect(page.get_by_role("heading", name="🔥 Founding Member Pricing - Lock in Forever!")).to_be_visible()

    print("Taking screenshot of pricing page...")
    page.screenshot(path="jules-scratch/verification/pricing_page.png")

    print("Verification script finished.")

# This is the entry point for the script
if __name__ == "__main__":
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_changes(page)
        browser.close()
