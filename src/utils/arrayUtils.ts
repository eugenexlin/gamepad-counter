export function safeNumArr(arr: number[][], i1, i2) {
    if (arr[i1] === undefined) {
        return 0;
    }
    if (arr[i1][i2] === undefined) {
        return 0;
    }
    return arr[i1][i2];
}

export function safeBoolArr(arr: boolean[][], i1, i2) {
    if (arr[i1] === undefined) {
        return false;
    }
    if (arr[i1][i2] === undefined) {
        return false;
    }
    return arr[i1][i2];
}
