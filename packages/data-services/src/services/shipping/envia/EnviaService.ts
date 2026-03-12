export class EnviaService {
    constructor(config: any) { }
    getCheckoutShippingRates(items: any, destination: any, carriers: any): Promise<any> {
        return Promise.resolve({ success: true, message: 'Not implemented properly' });
    }
}
