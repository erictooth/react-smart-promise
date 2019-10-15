import { useEffect } from "react";
import { makeCancelable, CancelablePromise } from "./makeCancelable";
import { usePromiseState } from "./usePromiseState";

type Options<T> = {
    mode?: "latest" | "every";
    onCancel?: (instance: Promise<T>) => void;
};

const defaultOptions: Options<any> = {
    mode: "latest",
    onCancel: undefined,
};

export function usePromise<T>(
    getPromise: (() => Promise<T>) | null,
    options: Options<T> = defaultOptions
) {
    const [state, dispatch] = usePromiseState<T>();

    useEffect(() => {
        const { mode = defaultOptions.mode, onCancel = defaultOptions.onCancel } = options;

        if (typeof getPromise === "undefined" || getPromise === null) {
            dispatch({ type: "RESET" });
            return;
        }

        if (typeof getPromise !== "function") {
            throw new Error(
                `usePromise requires a function argument, but received ${typeof getPromise}`
            );
        }

        // Build an object containing a function to initiate the promise
        // as well as a function to cancel it. Use the customCancel arg
        // if it's provided.
        const promise: CancelablePromise<T> = onCancel
            ? {
                  getPromise,
                  cancel: () => undefined,
              }
            : makeCancelable<T>(getPromise);

        dispatch({ type: "ADD", promise });

        const instance = promise.getPromise();

        instance.then((result) => {
            dispatch({ type: "COMPLETE", promise, result: { status: "SUCCESS", value: result } });
        });

        if (typeof onCancel === "function") {
            promise.cancel = () => onCancel(instance);
        }

        return () => {
            if (mode === "latest") {
                dispatch({ type: "CLEANUP", promise });
            }
        };
    }, [getPromise, dispatch, options]);

    return state;
}
