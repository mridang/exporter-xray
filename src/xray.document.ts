export interface AWS {
  ecs?: {
    // https://github.com/aws/aws-xray-sdk-java/blob/63ace4ace34473bf2e071cfbbba79fa92388af61/aws-xray-recorder-sdk-core/src/main/java/com/amazonaws/xray/plugins/ECSPlugin.java#L43
    container?: string; // Renamed to match schema
    container_name?: string; // Not in schema
    container_id?: string; // Not in schema
    availability_zone?: string; // Not in schema
    container_arn?: string; // Not in schema
    cluster_arn?: string; // Not in schema
    task_arn?: string; // Not in schema
    task_family?: string; // Not in schema
    launch_type?: string; // Not in schema
  };
  ec2?: {
    // https://github.com/aws/aws-xray-sdk-java/blob/63ace4ace34473bf2e071cfbbba79fa92388af61/aws-xray-recorder-sdk-core/src/main/java/com/amazonaws/xray/plugins/EC2Plugin.java#L47
    instance_id?: string;
    availability_zone?: string;
    instance_size?: string;
    ami_id?: string;
  };
  elastic_beanstalk?: {
    // https://github.com/aws/aws-xray-sdk-java/blob/63ace4ace34473bf2e071cfbbba79fa92388af61/aws-xray-recorder-sdk-core/src/main/java/com/amazonaws/xray/plugins/ElasticBeanstalkPlugin.java#L43
    environment?: string;
    version_label?: string;
    deployment_id?: number;
  };
  eks?: {
    // https://github.com/aws/aws-xray-sdk-java/blob/63ace4ace34473bf2e071cfbbba79fa92388af61/aws-xray-recorder-sdk-core/src/main/java/com/amazonaws/xray/plugins/EKSPlugin.java#L43
    cluster_name?: string;
    pod?: string;
    container_id?: string;
  };
  cloudwatch_logs?: Log[];
  xray: {
    // https://github.com/aws/aws-xray-sdk-node/blob/b39b5e298ae600e8e2975a609059fe67e6fd6cd6/packages/core/lib/aws-xray.js#L382-L386
    sdk?: string;
    sdk_version?: string;
    auto_instrumentation?: boolean;
  };
  tracing?: {
    sdk?: string;
  };
  account_id?: string;
  retries?: number; // Not in schema
  region?: string; // Not in schema
  operation?: string;
  request_id?: string;
  id_2?: string; // Not in schema
  bucket_name?: string; // Not in schema
  key?: string; // Not in schema
  table_name?: string;
  resource_names?: string[]; // Not in schema
  message_id?: string; // Not in schema
  queue_url?: string; // Not in schema
}

export interface Request {
  url?: string;
  method?: string;
  user_agent?: string;
  client_ip?: string;
  x_forwarded_for?: boolean;
}

export interface Response {
  status?: number;
  content_length?: number;
}

export interface Log {
  log_group: string;
  arn?: string;
}

export interface Link {
  id: string;
  trace_id: string;
  attributes: { [key: string]: unknown | undefined };
}

// https://github.com/aws/aws-xray-sdk-node/blob/b39b5e298ae600e8e2975a609059fe67e6fd6cd6/packages/core/lib/aws-xray.js#L375-L379
export interface Service {
  version: string;
  runtime?: string; // Not in schema
  runtime_version?: string; // Not in schema
  name?: string; // Not in schema
}

export interface HTTP {
  request?: Request;
  response?: Response;
}

export interface Cause {
  working_directory?: string;
  exceptions?: Exception[];
}

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

export interface Stack {
  path?: string;
  line?: number;
  label?: string;
}

export interface SQL {
  connection_string?: string; // Not in schema
  url?: string;
  sanitized_query?: string; // Not in schema
  database_type?: string;
  database_version?: string;
  driver_version?: string;
  user?: string;
  preparation?: 'call' | 'statement' | 'unknown';
}

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
  links?: Link[]; // Not in schema
}
