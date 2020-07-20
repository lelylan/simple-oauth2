// options

export interface ClientOptions {
  id: string;
  secret: string;
  idParamName?: string;
  secretParamName?: string;
}
export interface AuthOptions {
  tokenHost: string;
  tokenPath?: string;
  revokePath?: string;
  authorizeHost?: string;
  authorizePath?: string;
}

export interface HttpOptions {
  json?: string;
  redirects?: number;
  headers?: any;
}
export interface ModuleOptions {
  scopeSeparator?: string;
  credentialsEncodingMode?: string;
  bodyFormat?: string;
  authorizationMethod?: string;

}
export interface AuthorizationOptions {
  client: ClientOptions;
  auth: AuthOptions;
  http: HttpOptions;
  options: ModuleOptions;
}

// arguments

export interface AuthorizeParams {
  redirectURI: string;
  scope: string;
  state: string;
}

// todo complete
export interface HttpRequestOptions {
  [key: string]: any;
}

// private API
export declare class AccessToken {
  constructor(config: any, client: any, token: any);
  expired(expirationWindowSeconds: number): boolean;
  refresh(params: any): Promise<AccessToken>;
  revoke(tokenType: string): Promise<any>;
  revokeAll(): Promise<void>;
  toJSON(): string;
}

// public API

export declare class AuthorizationGrantType {
  constructor(config: AuthorizationOptions);
  getToken(params: AuthorizeParams, httpOptions?: HttpRequestOptions): Promise<AccessToken>;
  createToken(token: string): AccessToken;
}

export declare class AuthorizationCode extends AuthorizationGrantType {
  authorizeURL(params: AuthorizeParams): Promise<string>;
}

export declare class ClientCredentials extends AuthorizationGrantType {
}

export declare class ResourceOwnerPassword extends AuthorizationGrantType {
}
