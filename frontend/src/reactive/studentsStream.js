import {
  BehaviorSubject,
  Observable,
  catchError,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  timer,
} from "rxjs";
import { studentsApi } from "../api/studentsApi.js";

export const initialQuery = {
  search: "",
  id: "",
  fullName: "",
  group: "",
  isuId: "",
  dormitory: "",
  room: "",
  moveInDate: "",
  foreigner: "",
  notes: "",
  page: 0,
  size: 10,
  sortBy: "fullName",
  direction: "asc",
};
export function createStudentsStream(load = studentsApi.list, delay = 300) {
  const params$ = new BehaviorSubject({
    params: { ...initialQuery },
    wait: 0,
    revision: 0,
  });
  // Отписка Observable отменяет сетевой запрос, а не только скрывает его результат.
  const load$ = (params) =>
    new Observable((subscriber) => {
      const controller = new AbortController();
      load(params, controller.signal)
        .then((data) => {
          subscriber.next({ loading: false, data, error: null });
          subscriber.complete();
        })
        .catch((error) => {
          if (!subscriber.closed) subscriber.error(error);
        });
      return () => controller.abort();
    });
  const state$ = params$.pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    // Новое событие сразу отменяет старый запрос. Пауза применяется только к вводу текста.
    switchMap(({ params, wait }) =>
      timer(wait).pipe(
        switchMap(() => load$(params)),
        catchError((error) => of({ loading: false, data: null, error })),
        startWith({ loading: true, data: null, error: null }),
      ),
    ),
    map((state) => ({ ...state, query: params$.value.params })),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  return {
    state$,
    update(patch, { debounce = false } = {}) {
      const current = params$.value;
      const params = { ...current.params, ...patch };
      if (!Object.hasOwn(patch, "page")) params.page = 0;
      params$.next({
        params,
        wait: debounce ? delay : 0,
        revision: current.revision,
      });
    },
    reset() {
      params$.next({
        params: { ...initialQuery },
        wait: 0,
        revision: params$.value.revision + 1,
      });
    },
    reload() {
      params$.next({
        ...params$.value,
        wait: 0,
        revision: params$.value.revision + 1,
      });
    },
  };
}
