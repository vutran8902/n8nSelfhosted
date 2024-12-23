"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmazonSearch = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const scraper_1 = require("./scraper");
class AmazonSearch {
    constructor() {
        this.description = {
            displayName: 'Amazon Search',
            name: 'amazonSearch',
            icon: 'file:amazon.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Search for products on Amazon',
            defaults: {
                name: 'Amazon Search',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Query',
                    name: 'query',
                    type: 'string',
                    default: '',
                    placeholder: 'e.g. iPhone 13',
                    description: 'The search query to find products',
                    required: true,
                },
                {
                    displayName: 'Region',
                    name: 'region',
                    type: 'options',
                    options: [
                        { name: 'Canada', value: 'CA' },
                        { name: 'France', value: 'FR' },
                        { name: 'Germany', value: 'DE' },
                        { name: 'India', value: 'IN' },
                        { name: 'Italy', value: 'IT' },
                        { name: 'Spain', value: 'ES' },
                        { name: 'United Kingdom', value: 'UK' },
                        { name: 'United States', value: 'US' },
                    ],
                    default: 'US',
                    description: 'The Amazon region to search in',
                    required: true,
                },
                {
                    displayName: 'Affiliate Tag',
                    name: 'affiliateTag',
                    type: 'string',
                    default: '',
                    placeholder: 'e.g. myamazon-20',
                    description: 'Your Amazon affiliate tag for the selected region (optional)',
                },
                {
                    displayName: 'Minimum Price',
                    name: 'priceMin',
                    type: 'number',
                    default: 0,
                    description: 'Minimum price filter',
                },
                {
                    displayName: 'Maximum Price',
                    name: 'priceMax',
                    type: 'number',
                    default: 0,
                    description: 'Maximum price filter',
                },
                {
                    displayName: 'Results Limit',
                    name: 'limit',
                    type: 'number',
                    typeOptions: {
                        minValue: 1,
                    },
                    default: 50,
                    description: 'Max number of results to return',
                },
                {
                    displayName: 'Sort By',
                    name: 'orderBy',
                    type: 'options',
                    options: [
                        { name: 'Average Customer Review', value: 'review-rank' },
                        { name: 'Featured', value: 'featured' },
                        { name: 'Newest Arrivals', value: 'date-desc-rank' },
                        { name: 'Price: High to Low', value: 'price-desc-rank' },
                        { name: 'Price: Low to High', value: 'price-asc-rank' },
                    ],
                    default: 'featured',
                    description: 'How to sort the results',
                },
            ],
        };
    }
    async execute() {
        const returnData = [];
        const regionMap = {
            IN: {
                baseUrl: 'https://www.amazon.in',
                name: 'India',
                currency: 'INR',
                affiliateTag: '',
            },
            US: {
                baseUrl: 'https://www.amazon.com',
                name: 'United States',
                currency: 'USD',
                affiliateTag: '',
            },
            UK: {
                baseUrl: 'https://www.amazon.co.uk',
                name: 'United Kingdom',
                currency: 'GBP',
                affiliateTag: '',
            },
            DE: {
                baseUrl: 'https://www.amazon.de',
                name: 'Germany',
                currency: 'EUR',
                affiliateTag: '',
            },
            FR: {
                baseUrl: 'https://www.amazon.fr',
                name: 'France',
                currency: 'EUR',
                affiliateTag: '',
            },
            IT: {
                baseUrl: 'https://www.amazon.it',
                name: 'Italy',
                currency: 'EUR',
                affiliateTag: '',
            },
            ES: {
                baseUrl: 'https://www.amazon.es',
                name: 'Spain',
                currency: 'EUR',
                affiliateTag: '',
            },
            CA: {
                baseUrl: 'https://www.amazon.ca',
                name: 'Canada',
                currency: 'CAD',
                affiliateTag: '',
            },
        };
        try {
            const query = this.getNodeParameter('query', 0);
            const regionCode = this.getNodeParameter('region', 0);
            const affiliateTag = this.getNodeParameter('affiliateTag', 0, '');
            const priceMin = this.getNodeParameter('priceMin', 0, 0);
            const priceMax = this.getNodeParameter('priceMax', 0, 0);
            const limit = this.getNodeParameter('limit', 0, 10);
            const orderBy = this.getNodeParameter('orderBy', 0, 'featured');
            const region = regionMap[regionCode];
            if (!region) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Invalid region: ${regionCode}`);
            }
            region.affiliateTag = affiliateTag ? `?tag=${affiliateTag}` : '';
            const searchResult = await (0, scraper_1.searchProducts)({
                query,
                priceRange: {
                    min: priceMin || undefined,
                    max: priceMax || undefined,
                },
                limit,
                orderBy,
                region,
            });
            if (!searchResult.success) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), searchResult.error);
            }
            returnData.push({
                json: searchResult,
            });
            return [returnData];
        }
        catch (error) {
            if (error.message) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), error.message);
            }
            throw error;
        }
    }
}
exports.AmazonSearch = AmazonSearch;
//# sourceMappingURL=AmazonSearch.node.js.map