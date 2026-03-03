export class Order {
    constructor({
        id,
        academyName,
        phone,
        items = [],
        designRequestText = '',
        designFileUrl = '',
        proofImageUrl = '',
        total = 0,
        shippingFee = 0,
        status = 'NEW',
        modificationRequest = '',
        createdAt = new Date(),
    }) {
        this.id = id;
        this.academyName = academyName;
        this.phone = phone;
        this.items = items;
        this.designRequestText = designRequestText;
        this.designFileUrl = designFileUrl;
        this.proofImageUrl = proofImageUrl;
        this.total = total;
        this.shippingFee = shippingFee;
        this.status = status;
        this.modificationRequest = modificationRequest;
        this.createdAt = createdAt;
    }
}
