declare namespace simpleOauth2 {
  interface CredentialsHttpOptions {
    socketPath?: string;
    payload?: string;
    headers?: object;
    redirects?: number;
    redirect303?: boolean;
    beforeRedirect?: (
      redirectMethod: string,
      statusCode: number,
      location: string,
      resHeaders: object,
      redirectOptions: object,
      next: () => void
    ) => void;
    redirected?: (statusCode: number, location: string, req: object) => void;
    timeout?: number;
    rejectUnauthorized?: string;
    downstreamRes?: object;
    agent?: object | boolean;
    secureProtocol?: string;
    ciphers?: string[];
  }

  interface Credentials {
    client: {
      id: string;
      secret: string;
      secretParamName?: string;
      idParamName?: string;
    };
    auth: {
      tokenHost: string;
      tokenPath?: string;
      revokePath?: string;
      authorizeHost?: string;
      authorizePath?: string;
    };
    http?: CredentialsHttpOptions;
    options?: {
      bodyFormat?: "form" | "json";
      authorizationMethod?: "header" | "body";
    };
  }

  interface GetTokenOptions {
    code: string;
    redirect_uri: string;
    scope: string | string[];
  }

  interface AuthorizationCodeOptions {
    state: string;
    redirect_uri: string;
    scope: string | string[];
  }

  interface OwnerPasswordTokenConfig {
    username: string;
    password: string;
    scope: string | string[];
  }

  interface ClientCredentialsTokenConfig {
    scope: string | string[];
  }

  interface TokenObject extends TokenObjectOptions {
    expires_at: Date;
  }

  interface TokenObjectOptions {
    access_token: string;
    refresh_token: string;
    expires_in: string;
  }

  interface AccessToken {
    token: TokenObject;
    revoke: (token: "access_token" | "refresh_token") => void;
    revokeAll: () => void;
    refresh: () => AccessToken;
    expired: () => boolean;
  }

  interface Oauth2 {
    authorizationCode: {
      authorizeURL: (options: AuthorizationCodeOptions) => void;
      getToken: (options: GetTokenOptions) => TokenObject;
    };
    accessToken: {
      create: (token: TokenObjectOptions) => AccessToken;
    };
    ownerPassword: {
      getToken: (options: OwnerPasswordTokenConfig) => TokenObject;
    };
    clientCredentials: {
      getToken: (options: ClientCredentialsTokenConfig) => TokenObject;
    };
  }

  function create(credentials: Credentials): Oauth2;
}

export = simpleOauth2;
