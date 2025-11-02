export interface IPayload {
  sub: string;
  email: string;
  interfaceTo?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface IGoogleProfile {
  id: string;
  displayName: string;
  name: { familyName: string; givenName: string };
  emails: { value: string; verified: boolean }[];
  photos: { value: string }[];
  provider: string;
  _raw: string;
  _json: {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
  };
}

export interface IQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  status?: string;
  fromDate?: string;
  toDate?: string;
}
