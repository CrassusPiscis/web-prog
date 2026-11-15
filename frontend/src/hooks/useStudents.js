import { useEffect, useState } from "react";
import { createStudentsStream, initialQuery } from "../reactive/studentsStream";
import { subscribeToStudentChanges } from "../api/studentEvents.js";
export default function useStudents(initialData) {
  const [stream] = useState(() => createStudentsStream());
  const [state, setState] = useState({
    loading: !initialData,
    data: initialData,
    error: null,
    query: initialQuery,
  });
  useEffect(() => {
    const subscription = stream.state$.subscribe((next) => {
      if (next.data?.totalPages > 0 && next.query.page >= next.data.totalPages)
        stream.update({ page: next.data.totalPages - 1 });
      else if (next.data?.total === 0 && next.query.page !== 0)
        stream.update({ page: 0 });
      else setState(next);
    });
    const unsubscribeChanges = subscribeToStudentChanges(() => stream.reload());
    return () => {
      unsubscribeChanges();
      subscription.unsubscribe();
    };
  }, [stream]);
  return {
    ...state,
    update: stream.update,
    reset: stream.reset,
    reload: stream.reload,
  };
}
