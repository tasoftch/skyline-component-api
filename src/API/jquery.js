
export default (() => {
    if(window.jQuery)
        return window.jQuery;
    return null;
})()