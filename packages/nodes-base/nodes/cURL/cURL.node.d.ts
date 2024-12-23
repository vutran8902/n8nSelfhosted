import { INodeType, INodeTypeDescription, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
export interface ICurlReturnData {
    data: string;
    statusCode: number;
    statusMessage: string;
    headers: {
        [key: string]: (string | string[]);
    };
    setCookie?: {
        [key: string]: any;
    };
}
export declare class cURL implements INodeType {
    description: INodeTypeDescription;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
