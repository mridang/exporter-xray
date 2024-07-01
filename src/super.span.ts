import {
  CLOUDPLATFORMVALUES_AWS_EC2,
  CLOUDPLATFORMVALUES_AWS_ECS,
  CLOUDPLATFORMVALUES_AWS_EKS,
  CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK,
  CLOUDPROVIDERVALUES_AWS,
  SEMATTRS_DB_CONNECTION_STRING,
  SEMATTRS_DB_NAME,
  SEMATTRS_DB_STATEMENT,
  SEMATTRS_DB_SYSTEM,
  SEMATTRS_DB_USER,
  SEMATTRS_ENDUSER_ID,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_RPC_METHOD,
  SEMATTRS_RPC_SYSTEM,
  SEMRESATTRS_AWS_ECS_CLUSTER_ARN,
  SEMRESATTRS_AWS_ECS_CONTAINER_ARN,
  SEMRESATTRS_AWS_ECS_LAUNCHTYPE,
  SEMRESATTRS_AWS_ECS_TASK_ARN,
  SEMRESATTRS_AWS_ECS_TASK_FAMILY,
  SEMRESATTRS_CLOUD_AVAILABILITY_ZONE,
  SEMRESATTRS_CLOUD_PLATFORM,
  SEMRESATTRS_CLOUD_PROVIDER,
  SEMRESATTRS_CONTAINER_ID,
  SEMRESATTRS_CONTAINER_IMAGE_TAG,
  SEMRESATTRS_CONTAINER_NAME,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_HOST_ID,
  SEMRESATTRS_HOST_IMAGE_ID,
  SEMRESATTRS_HOST_TYPE,
  SEMRESATTRS_K8S_CLUSTER_NAME,
  SEMRESATTRS_K8S_POD_NAME,
  SEMRESATTRS_PROCESS_RUNTIME_NAME,
  SEMRESATTRS_PROCESS_RUNTIME_VERSION,
  SEMRESATTRS_SERVICE_INSTANCE_ID,
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_TELEMETRY_AUTO_VERSION,
  SEMRESATTRS_TELEMETRY_SDK_LANGUAGE,
  SEMRESATTRS_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';
import { SpanKind } from '@opentelemetry/api';
import { hrt, str, undef } from './util';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { AWS, Cause, HTTP, Link, Service, SQL } from './xray.document';
import {
  XSEMATTRS_AWS_ACCOUNT,
  XSEMATTRS_AWS_OPERATION,
  XSEMATTRS_AWS_REGION,
  XSEMATTRS_AWS_REQUEST_ID,
  XSEMATTRS_AWS_REQUEST_ID_2,
  XSEMATTRS_AWS_SERVICE,
} from './constants';
import { IdParser } from './id.parser';
import { HttpParser } from './http.parser';
import { CauseParser } from './cause.parser';
import { NameParser } from './name.parser';

export class EnhancedReadableSpan {
  private readonly DBS = [
    'db2',
    'derby',
    'hive',
    'mariadb',
    'mssql',
    'mysql',
    'oracle',
    'postgresql',
    'sqlite',
    'teradata',
    'other_sql',
  ];
  constructor(private readonly span: ReadableSpan) {
    //
  }

  /**
   * Determines the namespace of the span.
   *
   * The namespace can only be "aws" or "remote" based on the following logic:
   * - If the span is identified as an AWS SDK span, the namespace is "aws".
   * - If the span contains the AWS service attribute, the namespace is "aws".
   * - If the span kind is CLIENT, the namespace is "remote".
   *
   * @returns {string | undefined} The determined namespace, or undefined if no
   * namespace is set.
   * @see {@link https://docs.aws.amazon.com/xray/latest/devguide/
   * aws-xray-interface-api.html}
   */
  public getNamespace(): 'aws' | 'remote' | undefined {
    if (str(this.span.attributes[SEMATTRS_RPC_SYSTEM]) === 'aws-api') {
      return 'aws';
    } else if (this.span.attributes[XSEMATTRS_AWS_SERVICE]) {
      return 'aws';
    } else if (this.span.kind === SpanKind.CLIENT) {
      return 'remote';
    } else {
      return undefined;
    }
  }

  /**
   * Determines if the span is throttled based on the HTTP status code.
   *
   * @returns {boolean} True if the span is throttled, otherwise false.
   */
  public isThrottled(): true | undefined {
    if (Number(this.span.attributes[SEMATTRS_HTTP_STATUS_CODE]) === 429) {
      return true;
    } else {
      return undefined;
    }
  }

  /**
   * Determines if the span represents a fault based on the status code and HTTP
   * status code.
   *
   * @returns {boolean} True if the span represents a fault, otherwise false.
   */
  public isFault(): true | undefined {
    if (Number(this.span.attributes[SEMATTRS_HTTP_STATUS_CODE] || 0) >= 400) {
      return (
        Number(this.span.attributes[SEMATTRS_HTTP_STATUS_CODE] || 0) <= 499 ||
        undefined
      );
    } else {
      return undefined;
    }
  }

  /**
   * Determines if the span represents an error based on the status code and
   * HTTP status code.
   *
   * @returns {boolean} True if the span represents an error, otherwise false.
   */
  public isError(): true | undefined {
    if (Number(this.span.attributes[SEMATTRS_HTTP_STATUS_CODE] || 0) >= 500) {
      return (
        Number(this.span.attributes[SEMATTRS_HTTP_STATUS_CODE] || 0) <= 599 ||
        undefined
      );
    } else {
      return undefined;
    }
  }

  /**
   * Determines the service data for the span.
   *
   * The service data is derived from the resource attributes. The method looks
   * for the service version or container image tag to set the service version.
   *
   * @returns {Service} The service data
   * if no relevant attributes are found.
   */
  public getService(): Service {
    return {
      version:
        str(this.span.resource.attributes[SEMRESATTRS_SERVICE_VERSION]) ||
        str(this.span.resource.attributes[SEMRESATTRS_CONTAINER_IMAGE_TAG]) ||
        'unknown',
      runtime:
        str(this.span.resource.attributes[SEMRESATTRS_PROCESS_RUNTIME_NAME]) ||
        'unknown',
      runtime_version:
        str(
          this.span.resource.attributes[SEMRESATTRS_PROCESS_RUNTIME_VERSION],
        ) || 'unknown',
      name:
        str(this.span.resource.attributes[SEMRESATTRS_SERVICE_NAME]) ||
        'unknown',
    };
  }

  /**
   * Determines the origin of the span based on resource attributes.
   *
   * @returns {string | undefined} The determined origin, or undefined if no
   * relevant attributes are found.
   */
  public getOrigin(): string | undefined {
    if (!this.span.resource?.attributes) {
      return undefined;
    } else {
      if (
        this.span.resource?.attributes[SEMRESATTRS_CLOUD_PROVIDER] !==
        CLOUDPROVIDERVALUES_AWS
      ) {
        return undefined;
      } else {
        switch (this.span.resource?.attributes[SEMRESATTRS_CLOUD_PLATFORM]) {
          case 'aws_app_runner':
            return 'AWS::AppRunner::Service';
          case CLOUDPLATFORMVALUES_AWS_EKS:
            return 'AWS::EKS::Container';
          case CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK:
            return 'AWS::ElasticBeanstalk::Environment';
          case CLOUDPLATFORMVALUES_AWS_ECS:
            if (
              !this.span.resource?.attributes[SEMRESATTRS_AWS_ECS_LAUNCHTYPE]
            ) {
              return 'AWS::ECS::Container';
            }
            switch (
              this.span.resource?.attributes[SEMRESATTRS_AWS_ECS_LAUNCHTYPE]
            ) {
              case CLOUDPLATFORMVALUES_AWS_EC2:
                return 'AWS::ECS::EC2';
              case 'fargate':
                return 'AWS::ECS::Fargate';
              default:
                return 'AWS::ECS::Container';
            }
          case CLOUDPLATFORMVALUES_AWS_EC2:
            return 'AWS::EC2::Instance';
          default:
            return undefined;
        }
      }
    }
  }

  public getEndTime() {
    return hrt(this.span.endTime);
  }

  public getStartTime() {
    return hrt(this.span.startTime);
  }

  public getCause(causeParser: CauseParser): Cause {
    return causeParser.getCause(this.span);
  }

  public getName(nameParser: NameParser) {
    return nameParser.parseName(this.span);
  }

  public getSpanId() {
    return this.span.spanContext().spanId;
  }

  public getParentId() {
    return this.span.parentSpanId;
  }

  public getType() {
    if (
      this.span.kind !== SpanKind.SERVER &&
      this.getParentId() !== undefined
    ) {
      return 'subsegment';
    } else {
      return undefined;
    }
  }

  public getLinks(idParser: IdParser): Link[] | undefined {
    return undef(
      this.span.links?.map((link) => {
        return {
          span_id: link.context.spanId,
          trace_id: idParser.parseId(link.context.traceId),
          attributes: Object.fromEntries(
            Object.entries(link.attributes || {})
              .filter(([, value]) => value !== undefined)
              .map(([key, value]) => {
                return [key, value];
              }),
          ),
        };
      }),
    );
  }

  public getUser(): string | undefined {
    return str(this.span.attributes[SEMATTRS_ENDUSER_ID]);
  }

  public getHttp(httpParser: HttpParser): HTTP | undefined {
    return httpParser.parseHttp(this.span);
  }

  /**
   * 	Despite what the X-Ray documents say, having the DB connection string
   * 	set as the URL value of the segment is not useful. So let's use the
   * 	current span name instead
   */
  public getSql(): SQL | undefined {
    if (
      this.DBS.includes(str(this.span.attributes[SEMATTRS_DB_SYSTEM]) || '')
    ) {
      return {
        url: this.span.name,
        connection_string: `${this.span.attributes[SEMATTRS_DB_CONNECTION_STRING] || 'localhost'}/${this.span.attributes[SEMATTRS_DB_NAME] || ''}`,
        database_type: str(this.span.attributes[SEMATTRS_DB_SYSTEM]),
        user: str(this.span.attributes[SEMATTRS_DB_USER]),
        sanitized_query: str(this.span.attributes[SEMATTRS_DB_STATEMENT]),
      };
    } else {
      return undefined;
    }
  }

  public getAWS(): AWS {
    return {
      account_id: str(this.span.attributes[XSEMATTRS_AWS_ACCOUNT]),
      operation: str(
        this.span.attributes[XSEMATTRS_AWS_OPERATION] ||
          this.span.attributes[SEMATTRS_RPC_METHOD],
      ),
      region: str(this.span.attributes[XSEMATTRS_AWS_REGION]),
      request_id: str(this.span.attributes[XSEMATTRS_AWS_REQUEST_ID]),
      id_2: str(this.span.attributes[XSEMATTRS_AWS_REQUEST_ID_2]),
      // 		QueueURL:     awsxray.String(queueURL),
      // 		TableName:    awsxray.String(tableName),
      // 		TableNames:   tableNames,
      xray: {
        sdk:
          str(
            this.span.resource.attributes[SEMRESATTRS_TELEMETRY_SDK_LANGUAGE] ||
              '?',
          ) +
          '/' +
          str(this.span.resource.attributes[SEMRESATTRS_TELEMETRY_SDK_VERSION]),
        sdk_version: str(
          this.span.resource.attributes[SEMRESATTRS_TELEMETRY_SDK_VERSION],
        ),
        auto_instrumentation:
          this.span.resource.attributes[SEMRESATTRS_TELEMETRY_AUTO_VERSION] !==
          undefined,
      },
      eks:
        this.span.resource.attributes[SEMRESATTRS_CLOUD_PLATFORM] ===
        CLOUDPLATFORMVALUES_AWS_EKS
          ? {
              container_id: str(
                this.span.resource.attributes[SEMRESATTRS_CONTAINER_ID],
              ),
              cluster_name: str(
                this.span.resource.attributes[SEMRESATTRS_K8S_CLUSTER_NAME],
              ),
              pod: str(this.span.resource.attributes[SEMRESATTRS_K8S_POD_NAME]),
            }
          : undefined,
      ebs:
        this.span.resource.attributes[SEMRESATTRS_CLOUD_PLATFORM] ===
          CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK ||
        this.span.resource.attributes[SEMRESATTRS_SERVICE_INSTANCE_ID] !==
          undefined
          ? {
              environment: str(
                this.span.resource.attributes[
                  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT
                ],
              ),
              deployment_id: Number(
                this.span.resource.attributes[
                  SEMRESATTRS_SERVICE_INSTANCE_ID
                ] || '0',
              ),
              version_label: str(
                this.span.resource.attributes[SEMRESATTRS_SERVICE_VERSION],
              ),
            }
          : undefined,
      ecs:
        this.span.resource.attributes[SEMRESATTRS_CLOUD_PLATFORM] ===
        CLOUDPLATFORMVALUES_AWS_ECS
          ? {
              container_name: str(
                this.span.resource.attributes[SEMRESATTRS_CONTAINER_NAME],
              ),
              container_id: str(
                this.span.resource.attributes[SEMRESATTRS_CONTAINER_ID],
              ),
              availability_zone: str(
                this.span.resource.attributes[
                  SEMRESATTRS_CLOUD_AVAILABILITY_ZONE
                ],
              ),
              container_arn: str(
                this.span.resource.attributes[
                  SEMRESATTRS_AWS_ECS_CONTAINER_ARN
                ],
              ),
              cluster_arn: str(
                this.span.resource.attributes[SEMRESATTRS_AWS_ECS_CLUSTER_ARN],
              ),
              task_arn: str(
                this.span.resource.attributes[SEMRESATTRS_AWS_ECS_TASK_ARN],
              ),
              task_family: str(
                this.span.resource.attributes[SEMRESATTRS_AWS_ECS_TASK_FAMILY],
              ),
              launch_type: str(
                this.span.resource.attributes[SEMRESATTRS_AWS_ECS_LAUNCHTYPE],
              ),
            }
          : undefined,
      ec2:
        this.span.resource.attributes[SEMRESATTRS_CLOUD_PLATFORM] ===
          CLOUDPLATFORMVALUES_AWS_EC2 ||
        this.span.resource.attributes[SEMRESATTRS_HOST_ID] !== undefined
          ? {
              instance_id: str(
                this.span.resource.attributes[SEMRESATTRS_HOST_ID],
              ),
              availability_zone: str(
                this.span.resource.attributes[
                  SEMRESATTRS_CLOUD_AVAILABILITY_ZONE
                ],
              ),
              instance_size: str(
                this.span.resource.attributes[SEMRESATTRS_HOST_TYPE],
              ),
              ami_id: str(
                this.span.resource.attributes[SEMRESATTRS_HOST_IMAGE_ID],
              ),
            }
          : undefined,
    };
  }

  getTraceId(idParser: IdParser) {
    return idParser.parseId(this.span.spanContext().traceId);
  }
}
