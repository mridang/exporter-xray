import { SpanKind } from '@opentelemetry/api';
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
  SEMATTRS_NET_HOST_NAME,
  SEMATTRS_NET_HOST_PORT,
  SEMATTRS_NET_PEER_IP,
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_NET_PEER_PORT,
  SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES,
  SEMATTRS_MESSAGE_TYPE,
} from '@opentelemetry/semantic-conventions';
import { HTTP } from './xray.document';
import { ip, str } from './util';

export interface HttpParser {
  parseHttp(span: ReadableSpan): HTTP | undefined;
}

/**
 * TODO: also parse the content length from the events
 *
 * {@link https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/6dd3baea75a38706ff2611659d3ae8ad92720df1/exporter/awsxrayexporter/internal/translator/http.go}
 */
export class DefaultHttpParser implements HttpParser {
  toURL(url: {
    scheme: string;
    host: string;
    port?: string;
    path: string;
  }): string {
    return new URL(
      `${url.scheme}://${url.host}${url.port ? `:${url.port}` : ''}${url.path}`,
    ).toString();
  }

  parseHttp({ attributes, kind }: ReadableSpan): HTTP | undefined {
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
            url: [
              SEMATTRS_HTTP_URL,
              'url.full',
              SEMATTRS_HTTP_HOST,
              SEMATTRS_HTTP_SERVER_NAME,
              SEMATTRS_NET_HOST_NAME,
              'host.name',
              'server.address',
            ].some((attr) => attributes[attr] !== undefined)
              ? kind === SpanKind.SERVER
                ? str(
                    attributes[SEMATTRS_HTTP_URL] || attributes['url.full'],
                  ) ||
                  this.toURL({
                    scheme:
                      str(
                        attributes[SEMATTRS_HTTP_SCHEME] ||
                          attributes['url.scheme'],
                      ) || 'http',
                    host:
                      str(
                        attributes[SEMATTRS_HTTP_HOST] ||
                          attributes[SEMATTRS_HTTP_SERVER_NAME] ||
                          attributes[SEMATTRS_NET_HOST_NAME] ||
                          attributes['host.name'] ||
                          attributes['server.address'],
                      ) || 'host',
                    port: str(
                      attributes[SEMATTRS_NET_HOST_PORT] ||
                        attributes['server.port'],
                    ),
                    path:
                      str(
                        attributes[SEMATTRS_HTTP_TARGET] ||
                          attributes['url.path'],
                      ) || '/',
                  })
                : str(
                    attributes[SEMATTRS_HTTP_URL] || attributes['url.full'],
                  ) ||
                  this.toURL({
                    scheme:
                      str(
                        attributes[SEMATTRS_HTTP_SCHEME] ||
                          attributes['url.scheme'],
                      ) || 'http',
                    host:
                      str(
                        attributes[SEMATTRS_HTTP_HOST] ||
                          attributes[SEMATTRS_NET_PEER_NAME] ||
                          attributes[SEMATTRS_NET_PEER_IP],
                      ) || 'host',
                    port: str(attributes[SEMATTRS_NET_PEER_PORT]), //TODO: Cleanup default
                    path: str(attributes[SEMATTRS_HTTP_TARGET]) || '/',
                  })
              : undefined,
          },
          response: {
            status: attributes[SEMATTRS_HTTP_STATUS_CODE]
              ? Number(attributes[SEMATTRS_HTTP_STATUS_CODE])
              : Number(attributes['http.response.status_code']), //TODO: Create num function
            content_length:
              attributes[SEMATTRS_MESSAGE_TYPE] === 'RECEIVED'
                ? Number(
                    attributes[SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES],
                  )
                : 0,
          },
        }
      : undefined;
  }
}
