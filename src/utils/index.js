const promisify = async (fn) =>
    new Promise((resolve) => fn.then(res => resolve(res)))

const asyncHandler = fn => (req, res, next) => {
    fn(req, res, next).catch(next)
}

const debugConsole = (prefix, data) => {
    if (process.env.NODE_ENV === "dev") {
        console.log(prefix, "\n", data)
    }
}

module.exports = {
    promisify,
    asyncHandler,
    debugConsole
}