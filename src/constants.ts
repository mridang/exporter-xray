/**
 * An identifier for the AWS operation being performed. This doesn't exist in
 * the semantic conventions for OpenTelemetry.
 *
 * If you look at the attribute list defined by the AWS SDK instrumentation
 * you will see that this attribute is mentioned.
 * {@link https://github.com/open-telemetry/opentelemetry-js-contrib/tree/instrumentation-aws-sdk-v0.42.0/plugins/node/opentelemetry-instrumentation-aws-sdk}
 *
 * It is however mentioned into the OpenTelemetry Collector code, presumably
 * because this attribute is used but the attribute has not made its way into
 * the semantic conversions for OpenTelemetry yet.
 * {@link https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.104.0/internal/aws/xray/awsxray.go#L8}
 */
export declare const XSEMATTRS_AWS_OPERATION = 'aws.operation';

/**
 * An identifier for the AWS account ID. This doesn't exist in the semantic
 * conventions for OpenTelemetry.
 *
 * If you look at the attribute list defined by the AWS SDK instrumentation
 * you will see that this attribute is mentioned.
 * {@link https://github.com/open-telemetry/opentelemetry-js-contrib/tree/instrumentation-aws-sdk-v0.42.0/plugins/node/opentelemetry-instrumentation-aws-sdk}
 *
 * It is however mentioned into the OpenTelemetry Collector code, presumably
 * because this attribute is used but the attribute has not made its way into
 * the semantic conversions for OpenTelemetry yet.
 * {@link https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.104.0/internal/aws/xray/awsxray.go#L9}
 */
export declare const XSEMATTRS_AWS_ACCOUNT = 'aws.account_id';

/**
 * An identifier for the AWS region. This doesn't exist in the semantic
 * conventions for OpenTelemetry.
 *
 * If you look at the attribute list defined by the AWS SDK instrumentation
 * you will see that this attribute is mentioned.
 * {@link https://github.com/open-telemetry/opentelemetry-js-contrib/tree/instrumentation-aws-sdk-v0.42.0/plugins/node/opentelemetry-instrumentation-aws-sdk}
 *
 * It is however mentioned into the OpenTelemetry Collector code, presumably
 * because this attribute is used but the attribute has not made its way into
 * the semantic conversions for OpenTelemetry yet.
 * {@link https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.104.0/internal/aws/xray/awsxray.go#L10}
 */
export declare const XSEMATTRS_AWS_REGION = 'aws.region';

/**
 * An identifier for the AWS request ID. This doesn't exist in the semantic
 * conventions for OpenTelemetry.
 *
 * If you look at the attribute list defined by the AWS SDK instrumentation
 * you will see that this attribute is mentioned.
 * {@link https://github.com/open-telemetry/opentelemetry-js-contrib/tree/instrumentation-aws-sdk-v0.42.0/plugins/node/opentelemetry-instrumentation-aws-sdk}
 *
 * It is however mentioned into the OpenTelemetry Collector code, presumably
 * because this attribute is used but the attribute has not made its way into
 * the semantic conversions for OpenTelemetry yet.
 * {@link https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.104.0/internal/aws/xray/awsxray.go#L15}
 */
export declare const XSEMATTRS_AWS_REQUEST_ID = 'aws.request.id';

/**
 * An identifier for the AWS request ID. This doesn't exist in the semantic
 * conventions for OpenTelemetry.
 *
 * If you look at the attribute list defined by the AWS SDK instrumentation
 * you will see that this attribute is not mentioned.
 * {@link https://github.com/open-telemetry/opentelemetry-js-contrib/tree/instrumentation-aws-sdk-v0.42.0/plugins/node/opentelemetry-instrumentation-aws-sdk}
 *
 * It is however mentioned into the OpenTelemetry Collector code, presumably
 * because this attribute is used but the attribute has not made its way into
 * the semantic conversions for OpenTelemetry yet.
 * {@link https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.104.0/internal/aws/xray/awsxray.go#L14}
 */
export declare const XSEMATTRS_AWS_REQUEST_ID_2 = 'aws.requestId';

/**
 * An identifier for the AWS request ID (alternate format).
 */
export declare const XSEMATTRS_AWS_XREQUEST_ID = 'aws.request.extended_id';

/**
 * An identifier for the AWS queue URL. This doesn't exist in the semantic
 * conventions for OpenTelemetry.
 *
 * If you look at the attribute list defined by the AWS SDK instrumentation
 * you will see that this attribute is not mentioned.
 * {@link https://github.com/open-telemetry/opentelemetry-js-contrib/tree/instrumentation-aws-sdk-v0.42.0/plugins/node/opentelemetry-instrumentation-aws-sdk}
 *
 * It is however mentioned into the OpenTelemetry Collector code, presumably
 * because this attribute was used at some point and therefore this has been
 * ported over for backwards compatibility.
 * {@link https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.104.0/internal/aws/xray/awsxray.go#L15}
 *  */
export declare const XSEMATTRS_AWS_QUEUE_URL = 'aws.queue_url';

/**
 * An identifier for the AWS queue URL (alternate format). This doesn't exist
 * in the semantic
 * conventions for OpenTelemetry.
 *
 * If you look at the attribute list defined by the AWS SDK instrumentation
 * you will see that this attribute is not mentioned.
 * {@link https://github.com/open-telemetry/opentelemetry-js-contrib/tree/instrumentation-aws-sdk-v0.42.0/plugins/node/opentelemetry-instrumentation-aws-sdk}
 *
 * It is however mentioned into the OpenTelemetry Collector code, presumably
 * because this attribute was used at some point and therefore this has been
 * ported over for backwards compatibility.
 * {@link https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.104.0/internal/aws/xray/awsxray.go#L16}
 *  */
export declare const XSEMATTRS_AWS_QUEUE_URL_2 = 'aws.queue.url';

/**
 * An identifier for the AWS service being used. This doesn't exist in
 * the semantic conventions for OpenTelemetry.
 *
 * If you look at the attribute list defined by the AWS SDK instrumentation
 * you will see that this attribute is mentioned.
 * {@link https://github.com/open-telemetry/opentelemetry-js-contrib/tree/instrumentation-aws-sdk-v0.42.0/plugins/node/opentelemetry-instrumentation-aws-sdk}
 *
 * It is however mentioned into the OpenTelemetry Collector code, presumably
 * because this attribute is used but the attribute has not made its way into
 * the semantic conversions for OpenTelemetry yet.
 * {@link https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.104.0/internal/aws/xray/awsxray.go#L17}
 */
export declare const XSEMATTRS_AWS_SERVICE = 'aws.service';

/**
 * An identifier for the AWS table name. This doesn't exist in the semantic
 * conventions for OpenTelemetry.
 *
 * If you look at the attribute list defined by the AWS SDK instrumentation
 * you will see that this attribute is not mentioned.
 * {@link https://github.com/open-telemetry/opentelemetry-js-contrib/tree/instrumentation-aws-sdk-v0.42.0/plugins/node/opentelemetry-instrumentation-aws-sdk}
 *
 * It is however mentioned into the OpenTelemetry Collector code, presumably
 * because this attribute was used at some point and therefore this has been
 * ported over for backwards compatibility.
 * {@link https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.104.0/internal/aws/xray/awsxray.go#L18}
 */
export declare const XSEMATTRS_AWS_TABLE_NAME = 'aws.table_name';

/**
 * An identifier for the AWS table name (alternate format). This doesn't exist in
 * the semantic conventions for OpenTelemetry.
 *
 * If you look at the attribute list defined by the AWS SDK instrumentation
 * you will see that this attribute is not mentioned.
 * {@link https://github.com/open-telemetry/opentelemetry-js-contrib/tree/instrumentation-aws-sdk-v0.42.0/plugins/node/opentelemetry-instrumentation-aws-sdk}
 *
 * It is however mentioned into the OpenTelemetry Collector code, presumably
 * because this attribute was used at some point and therefore this has been
 * ported over for backwards compatibility.
 * {@link https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.104.0/internal/aws/xray/awsxray.go#L19}
 */
export declare const XSEMATTRS_AWS_TABLE_NAME_2 = 'aws.table.name';

/**
 * Annotations associated with an X-Ray segment.
 */
export declare const XSEMATTRS_AWS_XRAY_ANNOTATIONS = 'aws.xray.annotations';

/**
 * Prefix for metadata associated with an X-Ray segment.
 */
export declare const XSEMATTRS_AWS_XRAY_METADATA_PREFIX = 'aws.xray.metadata.';

/**
 * An identifier for the AWS S3 bucket name. This doesn't exist in the semantic
 * conventions for OpenTelemetry.
 *
 * If you look at the attribute list defined by the AWS SDK instrumentation
 * you will see that this attribute is not mentioned.
 * {@link https://github.com/open-telemetry/opentelemetry-js-contrib/tree/instrumentation-aws-sdk-v0.42.0/plugins/node/opentelemetry-instrumentation-aws-sdk}
 */
export declare const XSEMATTRS_AWS_BUCKET_NAME = 'aws.bucket.name';

/**
 * An identifier for the AWS S3 bucket key. This doesn't exist in the semantic
 * conventions for OpenTelemetry.
 *
 * If you look at the attribute list defined by the AWS SDK instrumentation
 * you will see that this attribute is not mentioned.
 * {@link https://github.com/open-telemetry/opentelemetry-js-contrib/tree/instrumentation-aws-sdk-v0.42.0/plugins/node/opentelemetry-instrumentation-aws-sdk}
 */
export declare const XSEMATTRS_AWS_BUCKET_KEY = 'aws.bucket.key';
