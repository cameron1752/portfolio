export function* bubbleSort(arr){

    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
        yield { compare: [j, j + 1] };
        if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            swapped = true;
            yield { swap: [j, j + 1] };
        }
        }
        if (!swapped) return;
    }

}

export function* selectionSort(arr){
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        for (let j = i + 1; j < n; j++) {
            yield { compare: [minIndex, j] };
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
            yield { swap: [i, minIndex] };
        }
    }
}

export function* quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        const pivotIndex = yield* partition(arr, low, high);
        yield* quickSort(arr, low, pivotIndex - 1);
        yield* quickSort(arr, pivotIndex + 1, high);
    }
}

function* partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        yield { compare: [j, high] };
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            yield { swap: [i, j] };
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    yield { swap: [i + 1, high] };
    return i + 1;
}

export function* mergeSort(arr, l = 0, r = arr.length - 1) {
    if (l < r) {
        const m = Math.floor((l + r) / 2);
        yield* mergeSort(arr, l, m);
        yield* mergeSort(arr, m + 1, r);
        yield* merge(arr, l, m, r);
    }
}

export function* merge(arr, l, m, r) {
    const n1 = m - l + 1;
    const n2 = r - m;

    const L = arr.slice(l, l + n1);
    const R = arr.slice(m + 1, m + 1 + n2);

    let i = 0, j = 0, k = l;

    while (i < n1 && j < n2) {
        yield { compare: [l + i, m + 1 + j] };
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        yield { overwrite: [k, arr[k]] };
        k++;
    }

    while (i < n1) {
        arr[k] = L[i];
        yield { overwrite: [k, arr[k]] };
        i++;
        k++;
    }

    while (j < n2) {
        arr[k] = R[j];
        yield { overwrite: [k, arr[k]] };
        j++;
        k++;
    }
}

export function checkSort(arr){
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < arr[i - 1]) {
            return false;
        }
    }
    return true;
}