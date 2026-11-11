/**
 * Type definitions for the AWS X-Ray trace segment documents this exporter sends.
 * @file
 */

/**
 * AWS-specific details of a segment, such as the ECS, EC2 and EKS plugin data.
 */
export interface AWS {
  /**
   * The ECS plugin data, see the {@link https://github.com/aws/aws-xray-sdk-java/blob/63ace4ace34473bf2e071cfbbba79fa92388af61/aws-xray-recorder-sdk-core/src/main/java/com/amazonaws/xray/plugins/ECSPlugin.java#L43 X-Ray Java ECS plugin}.
   */
  ecs?: {
    /** Renamed to match the schema. */
    container?: string;
    /** Not in the X-Ray segment schema. */
    container_name?: string;
    /** Not in the X-Ray segment schema. */
    container_id?: string;
    /** Not in the X-Ray segment schema. */
    availability_zone?: string;
    /** Not in the X-Ray segment schema. */
    container_arn?: string;
    /** Not in the X-Ray segment schema. */
    cluster_arn?: string;
    /** Not in the X-Ray segment schema. */
    task_arn?: string;
    /** Not in the X-Ray segment schema. */
    task_family?: string;
    /** Not in the X-Ray segment schema. */
    launch_type?: string;
  };

  /**
   * The EC2 plugin data, see the {@link https://github.com/aws/aws-xray-sdk-java/blob/63ace4ace34473bf2e071cfbbba79fa92388af61/aws-xray-recorder-sdk-core/src/main/java/com/amazonaws/xray/plugins/EC2Plugin.java#L47 X-Ray Java EC2 plugin}.
   */
  ec2?: {
    instance_id?: string;
    availability_zone?: string;
    instance_size?: string;
    ami_id?: string;
  };

  /**
   * The Elastic Beanstalk plugin data, see the {@link https://github.com/aws/aws-xray-sdk-java/blob/63ace4ace34473bf2e071cfbbba79fa92388af61/aws-xray-recorder-sdk-core/src/main/java/com/amazonaws/xray/plugins/ElasticBeanstalkPlugin.java#L43 X-Ray Java Elastic Beanstalk plugin}.
   */
  elastic_beanstalk?: {
    environment?: string;
    version_label?: string;
    deployment_id?: number;
  };

  /**
   * The EKS plugin data, see the {@link https://github.com/aws/aws-xray-sdk-java/blob/63ace4ace34473bf2e071cfbbba79fa92388af61/aws-xray-recorder-sdk-core/src/main/java/com/amazonaws/xray/plugins/EKSPlugin.java#L43 X-Ray Java EKS plugin}.
   */
  eks?: {
    cluster_name?: string;
    pod?: string;
    container_id?: string;
  };
  cloudwatch_logs?: Log[];

  /**
   * The X-Ray SDK details, see the {@link https://github.com/aws/aws-xray-sdk-node/blob/b39b5e298ae600e8e2975a609059fe67e6fd6cd6/packages/core/lib/aws-xray.js#L382-L386 X-Ray Node SDK}.
   */
  xray: {
    sdk?: string;
    sdk_version?: string;
    auto_instrumentation?: boolean;
  };
  tracing?: {
    sdk?: string;
  };
  account_id?: string;
  /** Not in the X-Ray segment schema. */
  retries?: number;
  /** Not in the X-Ray segment schema. */
  region?: string;
  operation?: string;
  request_id?: string;
  /** Not in the X-Ray segment schema. */
  id_2?: string;
  /** Not in the X-Ray segment schema. */
  bucket_name?: string;
  /** Not in the X-Ray segment schema. */
  key?: string;
  table_name?: string;
  /** Not in the X-Ray segment schema. */
  resource_names?: string[];
  /** Not in the X-Ray segment schema. */
  message_id?: string;
  /** Not in the X-Ray segment schema. */
  queue_url?: string;
}

/**
 * HTTP request details of a segment.
 */
export interface Request {
  url?: string;
  method?: string;
  user_agent?: string;
  client_ip?: string;
  x_forwarded_for?: boolean;
}

/**
 * HTTP response details of a segment.
 */
export interface Response {
  status?: number;
  content_length?: number;
}

/**
 * A CloudWatch Logs group associated with a segment.
 */
export interface Log {
  log_group: string;
  arn?: string;
}

/**
 * A link from a segment to another trace.
 */
export interface Link {
  id: string;
  trace_id: string;
  attributes: { [key: string]: unknown | undefined };
}

/**
 * Service details of a segment, see the {@link https://github.com/aws/aws-xray-sdk-node/blob/b39b5e298ae600e8e2975a609059fe67e6fd6cd6/packages/core/lib/aws-xray.js#L375-L379 X-Ray Node SDK}.
 */
export interface Service {
  version: string;
  /** Not in the X-Ray segment schema. */
  runtime?: string;
  /** Not in the X-Ray segment schema. */
  runtime_version?: string;
  /** Not in the X-Ray segment schema. */
  name?: string;
}

/**
 * HTTP details of a segment.
 */
export interface HTTP {
  request?: Request;
  response?: Response;
}

/**
 * The error cause of a segment.
 */
export interface Cause {
  working_directory?: string;
  exceptions?: Exception[];
}

/**
 * An exception recorded as part of a segment's error cause.
 */
export interface Exception {
  id: string;
  message?: string;
  type?: string;
  remote?: boolean;
  truncated?: number;
  skipped?: number;
  cause?: string;
  stack?: Stack[];
}

/**
 * A single stack frame of an exception.
 */
export interface Stack {
  path?: string;
  line?: number;
  label?: string;
}

/**
 * SQL details of a database segment.
 */
export interface SQL {
  /** Not in the X-Ray segment schema. */
  connection_string?: string;
  url?: string;
  /** Not in the X-Ray segment schema. */
  sanitized_query?: string;
  database_type?: string;
  database_version?: string;
  driver_version?: string;
  user?: string;
  preparation?: 'call' | 'statement' | 'unknown';
}

/**
 * A trace segment or subsegment document, as sent to AWS X-Ray.
 */
export interface XrayTraceDataSegmentDocument {
  id: string;
  name: string;
  start_time: number;
  end_time?: number;
  in_progress?: boolean;
  trace_id?: string;
  subsegments?: XrayTraceDataSegmentDocument[];
  parent_id?: string;
  origin?: string;
  aws?: AWS;
  error?: boolean;
  fault?: boolean;
  throttle?: boolean;
  namespace?: 'aws' | 'remote';
  user?: string;
  http?: HTTP;
  cause?: Cause;
  annotations?: { [key: string]: string | number | boolean };
  metadata?: { [key: string]: { [key: string]: unknown } };
  sql?: SQL;
  service?: Service;
  type?: 'subsegment';
  /** Not in the X-Ray segment schema. */
  links?: Link[];
}
