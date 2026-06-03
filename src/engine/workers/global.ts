/** Worker thread global — cast avoids clashing with DOM `Window` typing for `self`. */
export const worker = self as unknown as Worker;
