declare namespace Express {
  interface Request {
    admin?: {
      email: string;
    };
  }
}
