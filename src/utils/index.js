const promisify = async (fn) =>
    new Promise((resolve) => fn.then(res => resolve(res)))

const asyncHandler = fn => (req, res, next) => {
    fn(req, res, next).catch(next)
}

module.exports = {
    promisify,
    asyncHandler
}