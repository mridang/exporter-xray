/**
 * Extracts HTTP request and response details from OpenTelemetry spans.
 * @file
 */
import { Attributes, SpanKind } from '@opentelemetry/api';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import {
  SEMATTRS_HTTP_CLIENT_IP,
  SEMATTRS_HTTP_HOST,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_SCHEME,
  SEMATTRS_HTTP_SERVER_NAME,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_HTTP_TARGET,
  SEMATTRS_HTTP_URL,
  SEMATTRS_HTTP_USER_AGENT,
  SEMATTRS_MESSAGE_TYPE,
  SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES,
  SEMATTRS_NET_HOST_NAME,
  SEMATTRS_NET_HOST_PORT,
  SEMATTRS_NET_PEER_IP,
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_NET_PEER_PORT,
} from '@opentelemetry/semantic-conventions';
import { HTTP } from './xray.document.js';
import { ip, num, str } from './util.js';

/**
 * Returns the first truthy attribute value among the given keys.
 * @param attributes - The span attributes to read from.
 * @param keys - The attribute keys to try, in order of preference.
 * @returns The first truthy attribute value, or undefined when none is set.
 * @example
 * ```ts
 * firstAttribute({ a: '', b: 'x' }, ['a', 'b']); // Returns 'x'.
 * ```
 */
function firstAttribute(attributes: Attributes, keys: string[]): unknown {
  return keys.map((key) => attributes[key]).find(Boolean);
}

export interface HttpParser {
  parseHttp(span: ReadableSpan): HTTP | undefined;
}

/**
 * Parses the HTTP request and response details of a span.
 *
 * The content length is not parsed from the span events yet.
 *
 * {@link https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/6dd3baea75a38706ff2611659d3ae8ad92720df1/exporter/awsxrayexporter/internal/translator/http.go OpenTelemetry Collector HTTP translator}.
 */
export class DefaultHttpParser implements HttpParser {
  /**
   * Builds an absolute URL string from its parts.
   * @param url - The scheme, host, optional port and path of the URL.
   * @param url.scheme - The URL scheme, such as 'https'.
   * @param url.host - The host name or address.
   * @param [url.port] - The optional port number.
   * @param url.path - The path and query of the URL.
   * @returns The absolute URL as a string.
   * @example
   * ```ts
   * new DefaultHttpParser().toURL({ scheme: 'https', host: 'example.com', path: '/a' });
   * // Returns 'https://example.com/a'.
   * ```
   */
  toURL(url: {
    scheme: string;
    host: string;
    port?: string;
    path: string;
  }): string {
    const port = url.port ? `:${url.port}` : '';
    return new URL(`${url.scheme}://${url.host}${port}${url.path}`).toString();
  }

  /**
   * Parses the HTTP details of a span from its attributes.
   * @param span - The span whose attributes and kind are inspected.
   * @returns The HTTP request and response details, or undefined when the span
   * carries no HTTP attributes.
   * @example
   * ```ts
   * const http = new DefaultHttpParser().parseHttp(span);
   * // http?.request?.method holds the HTTP method when present.
   * ```
   */
  parseHttp(span: ReadableSpan): HTTP | undefined {
    const { attributes, kind } = span;
    return [
      SEMATTRS_HTTP_METHOD,
      'http.request.method',
      SEMATTRS_HTTP_CLIENT_IP,
      SEMATTRS_HTTP_USER_AGENT,
      'user_agent.original',
      SEMATTRS_HTTP_STATUS_CODE,
      'http.response.status_code',
      SEMATTRS_HTTP_URL,
      'url.full',
      SEMATTRS_HTTP_SCHEME,
      'url.scheme',
      SEMATTRS_HTTP_HOST,
      SEMATTRS_HTTP_TARGET,
      SEMATTRS_HTTP_SERVER_NAME,
      SEMATTRS_NET_HOST_PORT,
      'host.name',
      'server.address',
      'server.port',
      SEMATTRS_NET_PEER_NAME,
      SEMATTRS_NET_PEER_PORT,
      SEMATTRS_NET_PEER_IP,
      'network.peer.address',
      'client.address',
      'url.path',
    ].some((key) => attributes[key] !== undefined)
      ? {
          request: {
            method: str(
              attributes[SEMATTRS_HTTP_METHOD] ||
                attributes['http.request.method'],
            ),
            client_ip: str(
              ip(str(attributes[SEMATTRS_HTTP_CLIENT_IP])) ||
                ip(str(attributes[SEMATTRS_NET_PEER_IP])) ||
                ip(str(attributes['network.peer.address'])) ||
                ip(str(attributes['client.address'])),
            ),
            user_agent: str(
              attributes[SEMATTRS_HTTP_USER_AGENT] ||
                attributes['user_agent.original'],
            ),
            x_forwarded_for:
              !attributes[SEMATTRS_HTTP_CLIENT_IP] &&
              attributes[SEMATTRS_NET_PEER_IP]
                ? true
                : undefined,
            url: this.parseUrl(attributes, kind),
          },
          response: {
            status: num(
              str(attributes[SEMATTRS_HTTP_STATUS_CODE]) ||
                str(attributes['http.response.status_code']),
            ),
            content_length:
              attributes[SEMATTRS_MESSAGE_TYPE] === 'RECEIVED'
                ? num(
                    str(
                      attributes[SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES],
                    ),
                  )
                : undefined,
          },
        }
      : undefined;
  }

  /**
   * Derives the request URL from the URL-related attributes of a span.
   * @param attributes - The span attributes to read the URL from.
   * @param kind - The kind of the span, which selects how the URL is built.
   * @returns The request URL, or undefined when no URL attribute is present.
   * @example
   * ```ts
   * new DefaultHttpParser().parseUrl(span.attributes, SpanKind.SERVER);
   * // Returns the full URL, or undefined when the span has no URL attributes.
   * ```
   */
  private parseUrl(attributes: Attributes, kind: SpanKind): string | undefined {
    const hasUrlAttribute = [
      SEMATTRS_HTTP_URL,
      'url.full',
      SEMATTRS_HTTP_HOST,
      SEMATTRS_HTTP_SERVER_NAME,
      SEMATTRS_NET_HOST_NAME,
      'host.name',
      'server.address',
    ].some((attr) => attributes[attr] !== undefined);
    if (!hasUrlAttribute) {
      return undefined;
    }
    return kind === SpanKind.SERVER
      ? this.parseServerUrl(attributes)
      : this.parseClientUrl(attributes);
  }

  /**
   * Builds the URL of a server span, preferring the full URL attribute.
   * @param attributes - The span attributes to read the URL from.
   * @returns The request URL of the server span.
   * @example
   * ```ts
   * new DefaultHttpParser().parseServerUrl({ 'url.full': 'https://example.com/a' });
   * // Returns 'https://example.com/a'.
   * ```
   */
  private parseServerUrl(attributes: Attributes): string {
    return (
      str(attributes[SEMATTRS_HTTP_URL] || attributes['url.full']) ||
      this.toURL({
        scheme:
          str(attributes[SEMATTRS_HTTP_SCHEME] || attributes['url.scheme']) ||
          'http',
        host:
          str(
            firstAttribute(attributes, [
              SEMATTRS_HTTP_HOST,
              SEMATTRS_HTTP_SERVER_NAME,
              SEMATTRS_NET_HOST_NAME,
              'host.name',
              'server.address',
            ]),
          ) || 'host',
        port: str(
          attributes[SEMATTRS_NET_HOST_PORT] || attributes['server.port'],
        ),
        path:
          str(attributes[SEMATTRS_HTTP_TARGET] || attributes['url.path']) ||
          '/',
      })
    );
  }

  /**
   * Builds the URL of a client span, falling back to the peer details.
   * @param attributes - The span attributes to read the URL from.
   * @returns The request URL of the client span.
   * @example
   * ```ts
   * new DefaultHttpParser().parseClientUrl({ 'http.target': '/a', 'net.peer.name': 'api.example.com' });
   * // Returns the URL built from the target and peer name, using the default scheme.
   * ```
   */
  private parseClientUrl(attributes: Attributes): string {
    return (
      str(attributes[SEMATTRS_HTTP_URL] || attributes['url.full']) ||
      this.toURL({
        scheme:
          str(attributes[SEMATTRS_HTTP_SCHEME] || attributes['url.scheme']) ||
          'http',
        host:
          str(
            attributes[SEMATTRS_HTTP_HOST] ||
              attributes[SEMATTRS_NET_PEER_NAME] ||
              attributes[SEMATTRS_NET_PEER_IP],
          ) || 'host',
        port: str(attributes[SEMATTRS_NET_PEER_PORT]),
        path: str(attributes[SEMATTRS_HTTP_TARGET]) || '/',
      })
    );
  }
}
