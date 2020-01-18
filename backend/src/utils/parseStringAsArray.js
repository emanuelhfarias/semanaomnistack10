module.exports = (string) => {
    return string.split(',').map(item => item.trim());
}