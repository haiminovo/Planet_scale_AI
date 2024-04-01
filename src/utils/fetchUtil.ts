export interface IFetchRes {
    code: number;
    msg: string;
    errorCode: number;
    err?: IErr;
    data?: any;
}

export interface IErr {
    errorCode: number;
    code: number;
    msg: string;
}

export const customFetch = (
    url: string ,
    method: string = 'GET',
    data: BodyInit | object | null = null,
    headers: HeadersInit = {}
) => {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            ...headers,
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }
    return fetch(url, options)
        .then(async (response) => {
            const res = await response.json();
            return res;
        })
        .catch((error) => {
            console.error('Fetch error:', error);
            throw error;
        });
};
