from playwright.sync_api import Page, expect

def verify_alignment(page: Page):
    """
    This script verifies the body alignment on the demo page.
    """
    print("Navigating to demo page...")
    page.goto("http://localhost:3000/demo")
    page.wait_for_load_state("networkidle")

    print("Taking screenshot of demo page...")
    page.screenshot(path="jules-scratch/verification/alignment_verification.png")

    print("Verification script finished.")

# This is the entry point for the script
if __name__ == "__main__":
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_alignment(page)
        browser.close()
