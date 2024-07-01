export interface AWS {
  ecs?: {
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
    instance_id?: string;
    availability_zone?: string;
    instance_size?: string;
    ami_id?: string;
  };
  ebs?: {
    environment?: string;
    version_label?: string;
    deployment_id?: number;
  };
  eks?: {
    cluster_name?: string;
    pod?: string;
    container_id?: string;
  };
  xray: {
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
  table_name?: string;
  resource_names?: string[]; // Not in schema
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

export interface Link {
  span_id: string;
  trace_id: string;
  attributes: { [key: string]: unknown | undefined };
}

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
  inferred?: boolean; // Not in schema
  cause?: Cause;
  annotations?: { [key: string]: string | number | boolean };
  metadata?: { [key: string]: { [key: string]: unknown } };
  sql?: SQL;
  service?: Service;
  type?: 'subsegment';
  links?: Link[]; // Not in schema
}
