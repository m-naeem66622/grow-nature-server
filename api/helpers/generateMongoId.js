const { ObjectId } = require('mongodb');

function generateMongoId() {
    const id = new ObjectId();
    return id.toString();
}

module.exports = generateMongoId;