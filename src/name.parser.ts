import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { SpanKind } from '@opentelemetry/api';
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
import { str } from './util';

export interface NameParser {
  parseName(span: ReadableSpan): string;
}

export class DefaultNameParser implements NameParser {
  parseName(span: ReadableSpan): string {
    return (
      this.getSpanName(span) ||
      this.getLocalServiceName(span) ||
      this.getRemoteServiceName(span) ||
      this.getPeerService(span) ||
      this.getAwsService(span) ||
      this.getDatabaseName(span) ||
      this.getResourceServiceName(span) ||
      this.getRpcService(span) ||
      this.getHttpHost(span) ||
      this.getNetPeerName(span) ||
      'span'
    )
      .replace(/[^ 0-9\p{L}N_.:/%&#=+\-@]/gu, '')
      .slice(0, 200);
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
    let name = str(attributes[SEMATTRS_DB_NAME]);
    if (name) {
      const dbURL = str(attributes[SEMATTRS_DB_CONNECTION_STRING]);
      if (dbURL) {
        const dbURLStr = dbURL.startsWith('jdbc:') ? dbURL.slice(5) : dbURL;
        try {
          const parsed = new URL(dbURLStr);
          if (parsed.hostname) {
            name += `@${parsed.hostname}`;
          }
        } catch (e) {
          // Ignore URL parsing errors
        }
      }
    }
    return name;
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
