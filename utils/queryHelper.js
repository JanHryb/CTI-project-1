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

module.exports = { orderBy };
