import { useReducer } from "react";

import { CancelablePromise } from "./makeCancelable";

type CompletedPromise<T> =
    | {
          value: T;
          status: "SUCCESS";
      }
    | {
          value: unknown;
          status: "ERROR";
      };

type State<T> = {
    completed: CompletedPromise<T> | null;
    queued: CancelablePromise<T>[];
};

export type Actions<T> =
    | {
          type: "ADD";
          promise: CancelablePromise<T>;
      }
    | {
          type: "CLEANUP";
          promise: CancelablePromise<T>;
      }
    | {
          type: "COMPLETE";
          result: CompletedPromise<T>;
          promise: CancelablePromise<T>;
      }
    | {
          type: "RESET";
      };

const initialState: State<any> = {
    completed: null,
    queued: [],
};

export type PromiseStateReducer<T> = (state: State<T>, action: Actions<T>) => State<T>;

function promiseStateReducer<T>(state: State<T> = initialState, action: Actions<T>): State<T> {
    switch (action.type) {
        case "ADD":
            return {
                ...state,
                queued: [...state.queued, action.promise],
            };
        case "CLEANUP": {
            const { promise } = action;
            if (state.queued.indexOf(promise) === -1) {
                return state;
            }
            promise.cancel();
            return {
                ...state,
                queued: state.queued.filter((queuedPromise) => queuedPromise !== promise),
            };
        }
        case "COMPLETE": {
            const queueIndex = state.queued.indexOf(action.promise);

            // If a newer promise finishes before older promises, cancel the older promises
            state.queued.slice(0, queueIndex).forEach((previousPromise) => {
                previousPromise.cancel();
            });

            return {
                ...state,
                queued: state.queued.slice(queueIndex + 1),
                completed: action.result,
            };
        }
        case "RESET":
            return initialState;
        default:
            return state;
    }
}

export function usePromiseStateReducer<T>() {
    return useReducer<PromiseStateReducer<T>>(promiseStateReducer, initialState);
}
