export const intersection = (
  arr1: (string | number)[],
  arr2: (string | number)[],
): (string | number)[] => {
  const longestArr = arr1.length > arr2.length ? arr1 : arr2;
  const smallestArr = arr1.length > arr2.length ? arr2 : arr1;
  return smallestArr.reduce<(string | number)[]>((result, item) => {
    if (longestArr.includes(item)) result.push(item);
    return result;
  }, []);
};
