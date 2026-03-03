export class Partner {
    constructor({
        id,
        academyName,
        phone,
        status = 'WAITING',
        code = null,
        createdAt = new Date(),
    }) {
        this.id = id;
        this.academyName = academyName;
        this.phone = phone;
        this.status = status;
        this.code = code;
        this.createdAt = createdAt;
    }
}
