"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = searchProducts;
const puppeteer_1 = __importDefault(require("puppeteer"));
const DEFAULT_PRODUCT_LIMIT = 10;
async function scrapeProducts(page, limit, region) {
    let currentPage = 1;
    let allProducts = [];
    while (allProducts.length < limit) {
        const products = await page.evaluate((params) => {
            const productElements = document.querySelectorAll('.s-main-slot .s-result-item[data-component-type="s-search-result"]');
            const productData = [];
            productElements.forEach((product) => {
                var _a, _b, _c, _d, _e;
                if (params.currentLength + productData.length >= params.limit)
                    return;
                const titleElement = product.querySelector('h2 a span');
                const linkElement = product.querySelector('h2 a');
                const priceElement = product.querySelector('.a-price .a-offscreen');
                const imageElement = product.querySelector('img.s-image');
                const descElement = product.querySelector('.a-size-base-plus.a-color-base.a-text-normal');
                const ratingElement = product.querySelector('span.a-icon-alt');
                const reviewsElement = product.querySelector('span.a-size-base.s-underline-text');
                const primeElement = product.querySelector('.s-prime');
                if (titleElement && linkElement) {
                    const title = ((_a = titleElement.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                    const url = linkElement.getAttribute('href') || '';
                    const fullUrl = url.startsWith('http') ? url : `${params.baseUrl}${url}`;
                    const affiliateUrl = params.affiliateTag ? `${fullUrl}${params.affiliateTag}` : fullUrl;
                    productData.push({
                        id: Math.random().toString(36).substring(7),
                        title,
                        description: ((_b = descElement === null || descElement === void 0 ? void 0 : descElement.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || title,
                        price: parseFloat(((_c = priceElement === null || priceElement === void 0 ? void 0 : priceElement.textContent) === null || _c === void 0 ? void 0 : _c.replace(/[^0-9.]/g, '')) || '0'),
                        image: (imageElement === null || imageElement === void 0 ? void 0 : imageElement.getAttribute('src')) || '',
                        rating: ratingElement
                            ? parseFloat(((_d = ratingElement.textContent) === null || _d === void 0 ? void 0 : _d.split(' ')[0]) || '0')
                            : undefined,
                        reviews: reviewsElement
                            ? parseInt(((_e = reviewsElement.textContent) === null || _e === void 0 ? void 0 : _e.replace(/[^0-9]/g, '')) || '0')
                            : undefined,
                        prime: !!primeElement,
                        url: affiliateUrl,
                        currency: params.currency,
                    });
                }
            });
            return productData;
        }, {
            affiliateTag: region.affiliateTag,
            limit,
            baseUrl: region.baseUrl,
            currency: region.currency,
            currentLength: allProducts.length,
        });
        if (products.length === 0)
            break;
        allProducts = allProducts.concat(products);
        if (allProducts.length >= limit) {
            allProducts = allProducts.slice(0, limit);
            break;
        }
        currentPage++;
        const nextPageUrl = await page.evaluate(() => {
            const nextButton = document.querySelector('.s-pagination-next');
            return nextButton && !nextButton.classList.contains('s-pagination-disabled')
                ? nextButton.getAttribute('href')
                : null;
        });
        if (!nextPageUrl)
            break;
        await page.goto(`${region.baseUrl}${nextPageUrl}`, {
            waitUntil: 'domcontentloaded',
        });
    }
    return allProducts;
}
async function launchBrowser() {
    return puppeteer_1.default.launch({
        headless: true,
        args: [
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-web-security',
            '--disable-features=site-per-process',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            `--window-size=1920,1080`,
        ],
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    });
}
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
];
async function setupPage(browser) {
    const page = await browser.newPage();
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function (parameter) {
            if (parameter === 37445)
                return 'Intel Open Source Technology Center';
            if (parameter === 37446)
                return 'Mesa DRI Intel(R) HD Graphics (Skylake GT2)';
            return getParameter.call(this, parameter);
        };
    });
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': userAgent,
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        DNT: '1',
        'Upgrade-Insecure-Requests': '1',
    });
    await page.setViewport({
        width: 1920 + Math.floor(Math.random() * 100),
        height: 1080 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: true,
        isMobile: false,
    });
    return page;
}
async function searchProducts(params) {
    const { query, priceRange, limit = DEFAULT_PRODUCT_LIMIT, orderBy = '', region } = params;
    const browser = await launchBrowser();
    const page = await setupPage(browser);
    try {
        let searchURL = `${region.baseUrl}/s?k=${encodeURIComponent(query)}`;
        if (priceRange) {
            const { min, max } = priceRange;
            if (min !== undefined && max !== undefined) {
                searchURL += `&p_36=${min * 100}-${max * 100}`;
            }
            else if (min !== undefined) {
                searchURL += `&p_36=${min * 100}-`;
            }
            else if (max !== undefined) {
                searchURL += `&p_36=-${max * 100}`;
            }
        }
        if (orderBy) {
            searchURL += `&s=${orderBy}`;
        }
        await page.goto(searchURL, { waitUntil: 'domcontentloaded' });
        const products = await scrapeProducts(page, limit, region);
        return {
            success: true,
            data: products,
            region: {
                code: region.name,
                name: region.name,
                currency: region.currency,
            },
        };
    }
    catch (error) {
        console.error('Error searching products:', error);
        return { success: false, error: 'Failed to search products' };
    }
    finally {
        await browser.close();
    }
}
//# sourceMappingURL=scraper.js.map