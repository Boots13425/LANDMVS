/** Extract payload from API response { success, data, pagination } */
export function extractData(response) {
  const body = response?.data ?? response
  if (body?.data !== undefined) return body.data
  return body
}

export function extractList(response) {
  const data = extractData(response)
  return Array.isArray(data) ? data : []
}
