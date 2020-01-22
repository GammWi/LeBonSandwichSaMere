class Command {
    constructor(data = {
        id = null,
        created_at = null,
        updated_at = null,
        livraison = null,
        nom = null,
        mail = null,
        montant = null,
        remise = null,
        token = null,
        client_id = null,
        ref_paiement = null,
        date_paiement = null,
        mode_paiement = null,
        status = null,
    } = null) {
        let now = new Date();
        this.id = data.id;
        this.created_at = data.created_at ? data.created_at : now;
        this.updated_at = data.updated_at ? data.updated_at : now;
        this.livraison = data.livraison ? new Date(data.livraison) : new Date().setDate(now.getDay() + 7);
        this.nom = data.nom;
        this.mail = data.mail;
        this.montant = data.montant;
        this.remise = data.remise;
        this.token = data.token;
        this.client_id = data.client_id;
        this.ref_paiement = data.ref_paiement;
        this.date_paiement = data.date_paiement;
        this.mode_paiement = data.mode_paiement;
        this.status = data.status ? data.status : '1';
    }

    getArray() {
        let res = [];
        for (let lm in this) {
            res.push(this[lm]);
        }
        return res;
    }

    getUpdate() {
        return `${(this.created_at) !== undefined ? 'created_at =  \'' + this.toMysqlFormat(this.created_at) + '\',' : ''}
                ${(this.updated_at) !== undefined ? 'updated_at =  \'' + this.toMysqlFormat(this.updated_at) + '\',' : ''}
                 ${(this.livraison) !== undefined ? 'livraison =  \'' + this.toMysqlFormat(this.livraison) + '\',' : ''}
                       ${(this.nom) !== undefined ? 'nom =  \'' + this.nom + '\',' : ''}
                      ${(this.mail) !== undefined ? 'mail =  \'' + this.mail + '\',' : ''}
                   ${(this.montant) !== undefined ? 'montant = ' + this.montant + ',' : ''}
                     ${(this.remise) !== undefined ? 'remise =' + this.remise + ',' : ''}
                     ${(this.token) !== undefined ? 'token =  \'' + this.token + '\',' : ''}
                  ${(this.client_id) !== undefined ? 'client_id =' + this.client_id + ',' : ''}
               ${(this.ref_paiement) !== undefined ? 'ref_paiement = \'' + this.ref_paiement + '\',' : ''}
              ${(this.date_paiement) !== undefined ? 'date_paiement = \'' + this.toMysqlFormat(this.date_paiement) + '\',' : ''}
              ${(this.mode_paiement) !== undefined ? 'mode_paiement = \'' + this.mode_paiement + '\',' : ''}
                     ${(this.status) !== undefined ? 'status =' + this.status : ''}`;
    }

    twoDigits(d) {
        if (0 <= d && d < 10) return "0" + d.toString();
        if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
        return d.toString();
    }

    toMysqlFormat(date) {
        return date.getUTCFullYear() + "-" + this.twoDigits(1 + date.getUTCMonth()) + "-" + this.twoDigits(date.getUTCDate()) + " " + this.twoDigits(date.getUTCHours()) + ":" + this.twoDigits(date.getUTCMinutes()) + ":" + this.twoDigits(date.getUTCSeconds());
    };
}

module.exports = Command;