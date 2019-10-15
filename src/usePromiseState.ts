import { Dispatch } from "react";
import { usePromiseStateReducer, Actions } from "./usePromiseStateReducer";
import { StatusCondition } from "./StatusCondition.type";

type State<T> = [unknown | null, T | null, StatusCondition];

export function usePromiseState<T>(): [State<T>, Dispatch<Actions<T>>] {
    const [{ completed, queued }, dispatch] = usePromiseStateReducer<T>();

    const status: StatusCondition = (() => {
        if (queued.length) {
            return "PENDING";
        } else if (!completed) {
            return "INITIAL";
        }

        return completed.status;
    })();

    const state: State<T> = [
        completed && completed.status === "ERROR" ? completed.value : null,
        completed && completed.status === "SUCCESS" ? completed.value : null,
        status,
    ];

    return [state, dispatch];
}
