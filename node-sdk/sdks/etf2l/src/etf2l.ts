import { fetch, FetchResultTypes, isNullishOrEmpty } from "common";
import type {
  LogById,
  LogSearchRequest,
  LogSearchResponse,
  LogUploadRequest,
  LogUploadResponse,
} from "etf2l-api-types";
import { URLSearchParams } from "node:url";

const getRawLogUrl = (id: string) => `http://logs.tf/logs/log_${id}.log.zip`;

export class LogsTf {
  /**
   * URL of the API for logs.tf
   */
  #logsApiUrl = "https://logs.tf/api/v1";

  /**
   * (Optional) - The API key for logs.tf
   */
  #apiKey?: string;

  public constructor(apiKey?: string) {
    this.#apiKey = apiKey;
  }

  public async getById(logId: string) {
    if (isNullishOrEmpty(logId)) {
      throw new Error("LogId cannot be empty!");
    }

    return await fetch<LogById>(
      `${this.#logsApiUrl}/log/${logId}`,
      FetchResultTypes.JSON
    );
  }

  public async search({
    limit = 1000,
    map = null,
    offset = 0,
    player = [],
    title = null,
    uploader = null,
  }: LogSearchRequest) {
    if (limit > 10_000) {
      throw new Error("Cannot take more than 10,000 logs at a time");
    }

    const params = new URLSearchParams([
      ["limit", limit!.toString()],
      ["offset", offset!.toString()],
    ]);

    if (!isNullishOrEmpty(map)) {
      params.append("map", map);
    }

    if (!isNullishOrEmpty(player)) {
      params.append("player", player.join(","));
    }

    if (!isNullishOrEmpty(title)) {
      params.append("title", title);
    }

    if (!isNullishOrEmpty(uploader)) {
      params.append("uploader", uploader);
    }

    return await fetch<LogSearchResponse>(
      `${this.#logsApiUrl}/log${params.toString()}`,
      {},
      FetchResultTypes.JSON
    );
  }

  public async uploadLog(
    file: Blob,
    {
      title,
      map,
      updatelog = null,
      uploader = "node-logs-sdk",
    }: LogUploadRequest
  ) {
    // Note- We check for nullability here since API key is only required when uploading
    if (isNullishOrEmpty(this.#apiKey)) {
      throw new Error("Expected a valid API key, got a nullish value instead");
    }

    if (isNullishOrEmpty(title)) {
      throw new Error("Title cannot be empty!");
    }

    const body = new FormData();
    const headers = new Headers([["Content-Type", "multipart/form-data"]]);

    body.append("logfile", file);
    body.append("title", title);
    body.append("key", this.#apiKey);
    body.append("uploader", uploader!);

    if (!isNullishOrEmpty(updatelog)) {
      body.append("updatelog", updatelog);
    }

    if (!isNullishOrEmpty(map)) {
      body.append("map", map);
    }

    return await fetch<LogUploadResponse>(
      "http://logs.tf/upload",
      {
        body,
        headers,
      },
      FetchResultTypes.JSON
    );
  }

  public async getRawLog(logId: string) {
    if (isNullishOrEmpty(logId)) {
      throw new Error("LogId cannot be empty!");
    }

    return await fetch(getRawLogUrl(logId), FetchResultTypes.Buffer);
  }
}
