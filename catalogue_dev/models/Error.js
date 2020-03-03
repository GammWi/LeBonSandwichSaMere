class Error {
    constructor(data) {
        this.type = data.type;
        this.error = data.error;
        this.msg = data.msg;
    }
}

module.exports = Error;