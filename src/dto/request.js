const allLists = () => {
  const data = {
    id: 0,
    title: '',
    total_expenses: '',
    image: '',
    total_products: 0,
    total_items: 0,
  };

  return data;
};

const singleList = () => {
  const data = {
    id: 0,
    name: '',
    amount: 0,
    price: 0,
    total_price: 0,
    category: '',
    image: '',
  };

  return data;
};

export {
  allLists,
  singleList,
};