"use client";

import { useEffect, useState } from "react";

interface State<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function usePublicData<T>(path: string): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true });

  useEffect(() => {
    let active = true;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`)
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.message ?? `Request failed (${res.status})`);
        return body;
      })
      .then((body) => active && setState({ data: body.data as T, error: null, loading: false }))
      .catch((err: Error) => active && setState({ data: null, error: err.message, loading: false }));
    return () => {
      active = false;
    };
  }, [path]);

  return state;
}