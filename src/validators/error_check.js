const getError = (err) => {
  if (err.error !== undefined) {
    const errorList = err.error.details.map((error) => error.message);
    return errorList;
  }
  return [];
};

export default getError;