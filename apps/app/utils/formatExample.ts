export const formatExample = (example: string) => {
    return example.replace(/(\w)([A-Z])/g, '$1 $2');
};
