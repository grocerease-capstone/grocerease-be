class Response {
  static defaultOK(message, data) {
    const res = {
      status: true,
      code: 200,
      message,
      data,
    };
    return res;
  }

  static defaultCreated(message, data) {
    const res = {
      status: true,
      code: 201,
      message,
      data,
    };
    return res;
  }

  static defaultBadRequest(data) {
    const res = {
      status: false,
      code: 400,
      message: 'Bad request',
      data,
    };
    return res;
  }

  static defaultUnauthorized(data) {
    const res = {
      status: false,
      code: 401,
      message: 'Unauthorized access',
      data,
    };
    return res;
  }

  static defaultForbidden(data) {
    const res = {
      status: false,
      code: 403,
      message: 'Forbidden access',
      data,
    };
    return res;
  }

  static defaultNotFound(data) {
    const res = {
      status: false,
      code: 404,
      message: 'Request not found',
      data,
    };
    return res;
  }

  static defaultConflict(data) {
    const res = {
      status: false,
      code: 409,
      message: 'Resource already exist',
      data,
    };
    return res;
  }

  static customConflict(message, data) {
    const res = {
      status: false,
      code: 409,
      message,
      data,
    };
    return res;
  }

  static defaultInternalError(data) {
    const res = {
      status: false,
      code: 500,
      message: 'Request failed. Internal Server Error',
      data,
    };
    return res;
  }
}

export default Response;
