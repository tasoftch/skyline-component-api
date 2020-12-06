
export default (() => {
    if(window.jQuery)
        return window.jQuery;
    throw new Error("Skyline component API requires jQuery");
})()