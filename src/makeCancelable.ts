export type CancelablePromise<T> = {
    getPromise: () => Promise<T>;
    cancel: () => void;
};

export function makeCancelable<T>(getPromise: () => Promise<T>): CancelablePromise<T> {
    let canceled = false;

    return {
        getPromise: () =>
            new Promise((resolve, reject) => {
                getPromise()
                    .then((data) => {
                        if (!canceled) {
                            resolve(data);
                        }
                    })
                    .catch((error) => {
                        if (!canceled) {
                            reject(error);
                        }
                    });
            }),
        cancel: () => {
            canceled = true;
        },
    };
}
