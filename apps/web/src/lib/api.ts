export type HealthResponse = {
  status: string
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health', {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return (await res.json()) as HealthResponse
}
