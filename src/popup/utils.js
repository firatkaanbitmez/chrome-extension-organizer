export const Utility = (() => {
    const sortCategories = (categories) => {
        const sorted = Object.keys(categories).filter((cat) => cat !== 'Uncategorized').sort();
        if (categories['Uncategorized']) {
            sorted.push('Uncategorized');
        }
        return sorted;
    };

    return {
        sortCategories
    };
})();
