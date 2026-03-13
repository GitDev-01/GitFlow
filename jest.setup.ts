import '@testing-library/jest-dom';

if (typeof structuredClone === 'undefined') {
    global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}
