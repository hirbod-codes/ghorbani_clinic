export type MainProcessResponse<T> = {
    code: number,
    message?: string,
    data?: T
}
