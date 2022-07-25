const hasWhiteSpace = (str) => {
  return str.indexOf(" ") >= 0;
};
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
const isNumber = (str) => {
  if (Number.isNaN(Number(str))) {
    return false;
  }
  return true;
};

module.exports = { hasWhiteSpace, capitalizeFirstLetter, isNumber };
