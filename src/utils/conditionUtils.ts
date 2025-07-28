export const evaluateCondition = (condition: string, currentCase: any): boolean => {
  if (!condition) return true;
  try {
    const evalContext = { currentCase };
    const evalFunc = new Function('context', `with(context) { return ${condition}; }`);
    return evalFunc(evalContext);
  } catch (error) {
    console.error(`Error evaluating condition: ${condition}`, error);
    return false;
  }
};