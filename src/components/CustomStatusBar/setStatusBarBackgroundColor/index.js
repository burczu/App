/**
 * @param {String} backgroundColor
 */
export default (backgroundColor) => {
    document.querySelector('meta[name=theme-color]').content = backgroundColor;
};
