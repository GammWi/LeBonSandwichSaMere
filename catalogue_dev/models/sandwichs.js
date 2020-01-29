const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    id: { type: Number, index: true, unique: false, required: true },
    ref: {type: String, required: true},
    nom: { type: String, required: true },
    description: { type: String, text: true },
    type_pain: {type: String, text: true},
    image: {type: String},
    categories:{type: String},
    prix:{type: Number}
});

module.exports = mongoose.model("sandwichs", schema);
