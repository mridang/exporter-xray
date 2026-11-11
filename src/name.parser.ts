/**
 * Derives the AWS X-Ray segment name from the attributes of an OpenTelemetry span.
 * @file
 */
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { Attributes, SpanKind } from '@opentelemetry/api';
import {
  SEMATTRS_DB_CONNECTION_STRING,
  SEMATTRS_DB_NAME,
  SEMATTRS_HTTP_HOST,
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_PEER_SERVICE,
  SEMATTRS_RPC_SERVICE,
  SEMATTRS_RPC_SYSTEM,
  SEMRESATTRS_SERVICE_NAME,
} from '@opentelemetry/semantic-conventions';
import { str } from './util.js';

export interface NameParser {
  parseName(span: ReadableSpan): string;
}

export class DefaultNameParser implements NameParser {
  /**
   * Parses the segment name of a span, keeping only characters X-Ray accepts.
   * @param span - The span to name.
   * @returns The sanitised name, at most 200 characters long, falling back to
   * 'span' when no candidate name is available.
   * @example
   * ```ts
   * const parser = new DefaultNameParser();
   * parser.parseName(span); // Returns the span name, such as 'GET /users'.
   * ```
   */
  parseName(span: ReadableSpan): string {
    return this.resolveName(span)
      .replaceAll(/[^ 0-9\p{L}N_.:/%&#=+\-@]/gu, '')
      .slice(0, 200);
  }

  /**
   * Picks the first candidate name that is available for the span.
   * @param span - The span whose name candidates are evaluated in order.
   * @returns The first truthy candidate name, or 'span' if none is available.
   * @example
   * ```ts
   * new DefaultNameParser().resolveName(span); // Returns 'span' when nothing matches.
   * ```
   */
  private resolveName(span: ReadableSpan): string {
    const candidates: Array<(current: ReadableSpan) => string | undefined> = [
      (current) => this.getSpanName(current),
      (current) => this.getLocalServiceName(current),
      (current) => this.getRemoteServiceName(current),
      (current) => this.getPeerService(current),
      (current) => this.getAwsService(current),
      (current) => this.getDatabaseName(current),
      (current) => this.getResourceServiceName(current),
      (current) => this.getRpcService(current),
      (current) => this.getHttpHost(current),
      (current) => this.getNetPeerName(current),
    ];
    for (const candidate of candidates) {
      const name = candidate(span);
      if (name) {
        return name;
      }
    }
    return 'span';
  }

  private getLocalServiceName({
    attributes,
    kind,
  }: ReadableSpan): string | undefined {
    if (
      [SpanKind.SERVER, SpanKind.INTERNAL].includes(kind) &&
      str(attributes['aws.span.kind']) === 'local_root'
    ) {
      return str(attributes['aws.local.service']);
    }
    return undefined;
  }

  private getRemoteServiceName({
    attributes,
    kind,
  }: ReadableSpan): string | undefined {
    if (
      [SpanKind.CLIENT, SpanKind.PRODUCER, SpanKind.CONSUMER].includes(kind)
    ) {
      let name = str(attributes['aws.remote.service']);
      if (name) {
        name =
          str(attributes[SEMATTRS_RPC_SYSTEM]) === 'aws-api' &&
          name.startsWith('AWS.SDK.')
            ? name.slice(8)
            : name;
        return name;
      }
    }
    return undefined;
  }

  private getPeerService({ attributes }: ReadableSpan): string | undefined {
    return str(attributes[SEMATTRS_PEER_SERVICE]);
  }

  private getAwsService({ attributes }: ReadableSpan): string | undefined {
    return str(attributes['aws.service']);
  }

  private getDatabaseName({ attributes }: ReadableSpan): string | undefined {
    const name = str(attributes[SEMATTRS_DB_NAME]);
    if (!name) {
      return name;
    }
    const hostname = this.getDatabaseHostname(attributes);
    return hostname ? `${name}@${hostname}` : name;
  }

  /**
   * Extracts the host name from the database connection string of a span.
   * @param attributes - The span attributes holding the connection string.
   * @returns The host name of the connection string, or undefined when it has
   * no host or cannot be parsed as a URL.
   * @example
   * ```ts
   * new DefaultNameParser().getDatabaseHostname({
   *   'db.connection_string': 'jdbc:postgresql://db.internal:5432/app',
   * }); // Returns 'db.internal'.
   * ```
   */
  private getDatabaseHostname(attributes: Attributes): string | undefined {
    const dbURL = str(attributes[SEMATTRS_DB_CONNECTION_STRING]);
    if (!dbURL) {
      return undefined;
    }
    const dbURLStr = dbURL.startsWith('jdbc:') ? dbURL.slice(5) : dbURL;
    try {
      return new URL(dbURLStr).hostname || undefined;
    } catch {
      // Ignore URL parsing errors
      return undefined;
    }
  }

  private getResourceServiceName({
    resource,
    kind,
  }: ReadableSpan): string | undefined {
    return [SpanKind.SERVER].includes(kind)
      ? str(resource.attributes[SEMRESATTRS_SERVICE_NAME])
      : undefined;
  }

  private getRpcService({ attributes }: ReadableSpan): string | undefined {
    return str(attributes[SEMATTRS_RPC_SERVICE]);
  }

  private getHttpHost({ attributes }: ReadableSpan): string | undefined {
    return str(attributes[SEMATTRS_HTTP_HOST]);
  }

  private getNetPeerName({ attributes }: ReadableSpan): string | undefined {
    return str(attributes[SEMATTRS_NET_PEER_NAME]);
  }

  private getSpanName({ name }: ReadableSpan): string {
    return name;
  }
}
