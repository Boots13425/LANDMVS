export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  })
}

export const sendError = (res, message = 'An error occurred', statusCode = 500, data = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    data
  })
}

export const sendPaginated = (res, data, total, page, limit, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  })
}
