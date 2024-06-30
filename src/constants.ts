/**
 * An identifier for the AWS operation being performed.
 */
export declare const XSEMATTRS_AWS_OPERATION = 'aws.operation';

/**
 * An identifier for the AWS account ID.
 */
export declare const XSEMATTRS_AWS_ACCOUNT = 'aws.account_id';

/**
 * An identifier for the AWS region.
 */
export declare const XSEMATTRS_AWS_REGION = 'aws.region';

/**
 * An identifier for the AWS request ID.
 */
export declare const XSEMATTRS_AWS_REQUEST_ID = 'aws.request_id';

/**
 * An identifier for the AWS request ID (alternate format).
 */
export declare const XSEMATTRS_AWS_REQUEST_ID_2 = 'aws.requestId';

/**
 * An identifier for the AWS queue URL.
 */
export declare const XSEMATTRS_AWS_QUEUE_URL = 'aws.queue_url';

/**
 * An identifier for the AWS queue URL (alternate format).
 */
export declare const XSEMATTRS_AWS_QUEUE_URL_2 = 'aws.queue.url';

/**
 * An identifier for the AWS service being used.
 */
export declare const XSEMATTRS_AWS_SERVICE = 'aws.service';

/**
 * An identifier for the AWS table name.
 */
export declare const XSEMATTRS_AWS_TABLE_NAME = 'aws.table_name';

/**
 * An identifier for the AWS table name (alternate format).
 */
export declare const XSEMATTRS_AWS_TABLE_NAME_2 = 'aws.table.name';

/**
 * Flag indicating if an X-Ray segment is in progress.
 */
export declare const XSEMATTRS_AWS_XRAY_IN_PROGRESS = 'aws.xray.inprogress';

/**
 * Flag indicating if an X-Ray segment has forwarded IP addresses.
 */
export declare const XSEMATTRS_AWS_XRAY_X_FORWARDED_FOR =
  'aws.xray.x_forwarded_for';

/**
 * Resource ARN associated with an X-Ray segment.
 */
export declare const XSEMATTRS_AWS_XRAY_RESOURCE_ARN = 'aws.xray.resource_arn';

/**
 * Flag indicating if an X-Ray subsegment is traced.
 */
export declare const XSEMATTRS_AWS_XRAY_TRACED = 'aws.xray.traced';

/**
 * Annotations associated with an X-Ray segment.
 */
export declare const XSEMATTRS_AWS_XRAY_ANNOTATIONS = 'aws.xray.annotations';

/**
 * Prefix for metadata associated with an X-Ray segment.
 */
export declare const XSEMATTRS_AWS_XRAY_METADATA_PREFIX = 'aws.xray.metadata.';

/**
 * Number of retries associated with an X-Ray segment.
 */
export declare const XSEMATTRS_AWS_XRAY_RETRIES = 'aws.xray.retries';

/**
 * ID of an exception associated with an X-Ray segment.
 */
export declare const XSEMATTRS_AWS_XRAY_EXCEPTION_ID = 'aws.xray.exception.id';

/**
 * Remote indicator for an exception associated with an X-Ray segment.
 */
export declare const XSEMATTRS_AWS_XRAY_EXCEPTION_REMOTE =
  'aws.xray.exception.remote';

/**
 * Truncated indicator for an exception associated with an X-Ray segment.
 */
export declare const XSEMATTRS_AWS_XRAY_EXCEPTION_TRUNCATED =
  'aws.xray.exception.truncated';

/**
 * Skipped indicator for an exception associated with an X-Ray segment.
 */
export declare const XSEMATTRS_AWS_XRAY_EXCEPTION_SKIPPED =
  'aws.xray.exception.skipped';

/**
 * Cause of an exception associated with an X-Ray segment.
 */
export declare const XSEMATTRS_AWS_XRAY_EXCEPTION_CAUSE =
  'aws.xray.exception.cause';
