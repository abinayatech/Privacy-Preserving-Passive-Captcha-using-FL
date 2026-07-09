// tests/captcha-test-helper.js - NEW FILE
class CaptchaTestHelper {
    constructor(page) {
        this.page = page;
    }
    
    /**
     * Navigate to the test page with test mode enabled
     */
    async enableTestMode() {
        await this.page.goto('http://localhost:5003/?testMode=true');
        // Wait for CAPTCHA script to load
        await this.page.waitForFunction(() => window._captchaUtils !== undefined, { timeout: 5000 });
    }
    
    /**
     * Set a test result override
     * @param {string} result - 'human' or 'bot'
     */
    async setTestResult(result) {
        if (result !== 'human' && result !== 'bot') {
            throw new Error('Result must be "human" or "bot"');
        }
        
        const response = await this.page.evaluate((r) => {
            if (window._captchaUtils) {
                return window._captchaUtils.setTestResult(r);
            }
            throw new Error('Test mode not enabled');
        }, result);
        
        console.log(`Test helper: ${response}`);
        return response;
    }
    
    /**
     * Simulate human-like behavior patterns
     */
    async simulateHumanBehavior() {
        const response = await this.page.evaluate(() => {
            if (window._captchaUtils) {
                return window._captchaUtils.simulateHumanBehavior();
            }
            throw new Error('Test mode not enabled');
        });
        
        console.log(`Test helper: ${response}`);
        return response;
    }
    
    /**
     * Simulate bot-like behavior patterns
     */
    async simulateBotBehavior() {
        const response = await this.page.evaluate(() => {
            if (window._captchaUtils) {
                return window._captchaUtils.simulateBotBehavior();
            }
            throw new Error('Test mode not enabled');
        });
        
        console.log(`Test helper: ${response}`);
        return response;
    }
    
    /**
     * Get the current popup result
     */
    async getPopupResult() {
        return await this.page.evaluate(() => {
            const popup = document.querySelector('.captcha-popup');
            return popup ? {
                result: popup.getAttribute('data-result'),
                text: popup.textContent,
                isVisible: popup.style.display !== 'none'
            } : null;
        });
    }
    
    /**
     * Get collected FL data
     */
    async getFLData() {
        return await this.page.evaluate(() => window.lastSubmission || null);
    }
    
    /**
     * Fill the form with test data
     */
    async fillForm(aadhaar = '123456789012', password = 'Test@123') {
        await this.page.fill('#aadhaarNumber', aadhaar);
        await this.page.fill('#password', password);
    }
    
    /**
     * Submit the form
     */
    async submitForm() {
        await this.page.click('button[type="submit"]');
    }
    
    /**
     * Reset the CAPTCHA session
     */
    async resetSession() {
        const response = await this.page.evaluate(() => {
            if (window._captchaUtils) {
                return window._captchaUtils.resetSession();
            }
            throw new Error('Test mode not enabled');
        });
        
        console.log(`Test helper: ${response}`);
        return response;
    }
    
    /**
     * Get current metrics
     */
    async getMetrics() {
        return await this.page.evaluate(() => {
            if (window._captchaUtils) {
                return window._captchaUtils.getCurrentMetrics();
            }
            return null;
        });
    }
    
    /**
     * Wait for popup to appear with specific result
     */
    async waitForPopupResult(expectedResult, timeout = 5000) {
        await this.page.waitForFunction((result) => {
            const popup = document.querySelector('.captcha-popup');
            return popup && 
                   popup.style.display === 'block' && 
                   popup.getAttribute('data-result') === result;
        }, expectedResult, { timeout });
    }
}

module.exports = CaptchaTestHelper;