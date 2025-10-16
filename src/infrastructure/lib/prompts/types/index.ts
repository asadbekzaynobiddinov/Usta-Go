export type ErrorPrompt = {
  id: number;
  status: string;
  code: string;
  labels: string[];
};

export interface IResponseMap {
  [key: string]: {
    id: number;
    messages: {
      [key: string]: string;
    };
  };
}

export interface IPayload {
  sub: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}
