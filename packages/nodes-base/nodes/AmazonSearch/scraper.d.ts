import { SearchResult, AmazonRegion } from './types';
export declare function searchProducts(params: {
    query: string;
    priceRange?: {
        min?: number;
        max?: number;
    };
    limit?: number;
    orderBy?: string;
    region: AmazonRegion;
}): Promise<SearchResult>;
