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
      message: 'Bad Request',
      data,
    };
    return res;
  }

  static defaultUnauthorized(data) {
    const res = {
      status: false,
      code: 401,
      message: 'Unauthorized Access',
      data,
    };
    return res;
  }

  static defaultForbidden(data) {
    const res = {
      status: false,
      code: 403,
      message: 'Forbidden Access',
      data,
    };
    return res;
  }

  static defaultNotFound(data) {
    const res = {
      status: false,
      code: 404,
      message: 'Request Not Found',
      data,
    };
    return res;
  }

  static defaultConflict(data) {
    const res = {
      status: false,
      code: 409,
      message: 'Resource Already Exist',
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
      message: 'Request Failed. Internal Server Error',
      data,
    };
    return res;
  }
}

export default Response;
