const orderBy = (sort) => {
  if (sort == "price_desc") {
    return "order by products.product_price desc";
  } else if (sort == "price_asc") {
    return "order by products.product_price asc";
  } else if (sort == "name_asc") {
    return "order by products.product_name asc";
  } else if (sort == "name_desc") {
    return "order by products.product_name desc";
  } else {
    return "order by products.product_price desc";
  }
};

const whereIn = (productsArr) => {
  let IN = "where products.product_id in(";
  productsArr.forEach((value, index) => {
    if (index != productsArr.length - 1) {
      IN += `${value.product_id}, `;
    } else {
      IN += `${value.product_id})`;
    }
  });
  return IN;
};

module.exports = { orderBy, whereIn };
