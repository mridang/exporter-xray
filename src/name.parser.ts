import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { SpanKind } from '@opentelemetry/api';
import {
  SEMATTRS_DB_CONNECTION_STRING,
  SEMATTRS_DB_NAME,
  SEMATTRS_HTTP_HOST,
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_PEER_SERVICE,
  SEMATTRS_RPC_SERVICE,
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
      this.getName(span) ||
      this.getPeerService(span) ||
      this.getAwsService(span) ||
      this.getDatabaseName(span) ||
      this.getRpcService(span) ||
      this.getHttpHost(span) ||
      this.getNetPeerName(span) ||
      'span'
    )
      .replace(/[^ 0-9\p{L}_.:/%&#=+\-@]/gu, '')
      .slice(0, 200);
  }

  private getName({ attributes, kind }: ReadableSpan): string | undefined {
    if (kind === SpanKind.SERVER) {
      if (attributes['aws.local.service'] !== undefined) {
        return str(attributes['aws.local.service']);
      }
    }

    if (kind === SpanKind.INTERNAL) {
      if (str(attributes['aws.span.kind']) === 'local_root') {
        if (attributes['aws.local.service'] !== undefined) {
          return str(attributes['aws.local.service']);
        }
      }
    }

    if (kind === SpanKind.CLIENT) {
      if (attributes['aws.remote.service'] !== undefined) {
        return str(attributes['aws.remote.service']); //TODO: trimAwsSdkPrefix
      }
    }

    if (kind === SpanKind.PRODUCER) {
      if (attributes['aws.remote.service'] !== undefined) {
        return str(attributes['aws.remote.service']); //TODO: trimAwsSdkPrefix
      }
    }

    if (kind === SpanKind.CONSUMER) {
      if (attributes['aws.remote.service'] !== undefined) {
        return str(attributes['aws.remote.service']); //TODO: trimAwsSdkPrefix
      }
    }
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
