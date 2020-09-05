function RandomArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function FillArray(length, getValueAtIndex) {
    let arr = [];
    for (let index = 0; index < length; ++index) {
        arr[index] = getValueAtIndex(index);
    }
    return arr;
}

export {RandomArray, FillArray};