function deepCopy(obj) {
    if (typeof obj !== 'object') {
        return obj;
    }

    const newObj = Array.isArray(obj) ? [] : {};

    for (let key in obj) {
        newObj[key] = deepCopy(obj[key]);
    }

    return newObj;
}

module.exports = deepCopy;



