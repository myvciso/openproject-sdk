import type { ApiErrorBody } from "./types/hal.js";

export class OpenProjectError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: ApiErrorBody | unknown;
  readonly errorIdentifier?: string;

  constructor(
    message: string,
    options: {
      status: number;
      statusText: string;
      body?: unknown;
      errorIdentifier?: string;
    },
  ) {
    super(message);
    this.name = "OpenProjectError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.body = options.body;
    this.errorIdentifier = options.errorIdentifier;
  }

  static async fromResponse(response: Response): Promise<OpenProjectError> {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }

    const errorBody = body as ApiErrorBody | undefined;
    const message =
      errorBody?.message ??
      `OpenProject API request failed with status ${response.status}`;

    return new OpenProjectError(message, {
      status: response.status,
      statusText: response.statusText,
      body,
      errorIdentifier: errorBody?.errorIdentifier,
    });
  }
}
