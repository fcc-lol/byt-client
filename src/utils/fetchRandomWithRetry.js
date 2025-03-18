export const getRandomInRange = ({ min, max }) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const fetchRandomWithRetry = async ({
  fetch,
  validate = (data) => !!data,
  maxAttempts = 10,
  failed = (attempt, error) =>
    console.error(`Attempt ${attempt + 1} failed:`, error),
  range,
  getRandom = () => (range ? getRandomInRange(range) : null)
}) => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const data = await fetch(getRandom());

      if (validate(data)) {
        return { success: true, data };
      }

      attempts++;
      failed(attempts, new Error("Validation failed"));
    } catch (error) {
      attempts++;
      failed(attempts, error);
    }
  }

  return {
    success: false,
    error: `Failed after ${maxAttempts} attempts`
  };
};
