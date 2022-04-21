const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const menuSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    // image: {
    //     type: String,
    //     required: true
    // },
    description: {
        type: String,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;