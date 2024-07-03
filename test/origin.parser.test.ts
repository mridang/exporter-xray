import {
  SEMRESATTRS_CLOUD_PROVIDER,
  SEMRESATTRS_CLOUD_PLATFORM,
  SEMRESATTRS_AWS_ECS_LAUNCHTYPE,
  CLOUDPROVIDERVALUES_AWS,
  CLOUDPLATFORMVALUES_AWS_EKS,
  CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK,
  CLOUDPLATFORMVALUES_AWS_ECS,
  CLOUDPLATFORMVALUES_AWS_EC2,
} from '@opentelemetry/semantic-conventions';
import { DefaultOriginParser } from '../src';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';

describe('origin.parser test', () => {
  let parser: DefaultOriginParser;

  beforeEach(() => {
    parser = new DefaultOriginParser();
  });

  it('should return undefined if resource attributes are missing', () => {
    const span: ReadableSpan = { resource: {} } as ReadableSpan;
    expect(parser.getOrigin(span)).toBeUndefined();
  });

  it('should return undefined if cloud provider is not AWS', () => {
    const span: ReadableSpan = {
      resource: {
        attributes: {
          [SEMRESATTRS_CLOUD_PROVIDER]: 'gcp',
        },
      },
    } as unknown as ReadableSpan;
    expect(parser.getOrigin(span)).toBeUndefined();
  });

  it('should return AWS::AppRunner::Service for aws_app_runner platform', () => {
    const span: ReadableSpan = {
      resource: {
        attributes: {
          [SEMRESATTRS_CLOUD_PROVIDER]: CLOUDPROVIDERVALUES_AWS,
          [SEMRESATTRS_CLOUD_PLATFORM]: 'aws_app_runner',
        },
      },
    } as unknown as ReadableSpan;
    expect(parser.getOrigin(span)).toBe('AWS::AppRunner::Service');
  });

  it('should return AWS::EKS::Container for AWS EKS platform', () => {
    const span: ReadableSpan = {
      resource: {
        attributes: {
          [SEMRESATTRS_CLOUD_PROVIDER]: CLOUDPROVIDERVALUES_AWS,
          [SEMRESATTRS_CLOUD_PLATFORM]: CLOUDPLATFORMVALUES_AWS_EKS,
        },
      },
    } as unknown as ReadableSpan;
    expect(parser.getOrigin(span)).toBe('AWS::EKS::Container');
  });

  it('should return AWS::ElasticBeanstalk::Environment for AWS Elastic Beanstalk platform', () => {
    const span: ReadableSpan = {
      resource: {
        attributes: {
          [SEMRESATTRS_CLOUD_PROVIDER]: CLOUDPROVIDERVALUES_AWS,
          [SEMRESATTRS_CLOUD_PLATFORM]:
            CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK,
        },
      },
    } as unknown as ReadableSpan;
    expect(parser.getOrigin(span)).toBe('AWS::ElasticBeanstalk::Environment');
  });

  it('should return AWS::ECS::Container for AWS ECS platform without launch type', () => {
    const span: ReadableSpan = {
      resource: {
        attributes: {
          [SEMRESATTRS_CLOUD_PROVIDER]: CLOUDPROVIDERVALUES_AWS,
          [SEMRESATTRS_CLOUD_PLATFORM]: CLOUDPLATFORMVALUES_AWS_ECS,
        },
      },
    } as unknown as ReadableSpan;
    expect(parser.getOrigin(span)).toBe('AWS::ECS::Container');
  });

  it('should return AWS::ECS::EC2 for AWS ECS platform with EC2 launch type', () => {
    const span: ReadableSpan = {
      resource: {
        attributes: {
          [SEMRESATTRS_CLOUD_PROVIDER]: CLOUDPROVIDERVALUES_AWS,
          [SEMRESATTRS_CLOUD_PLATFORM]: CLOUDPLATFORMVALUES_AWS_ECS,
          [SEMRESATTRS_AWS_ECS_LAUNCHTYPE]: CLOUDPLATFORMVALUES_AWS_EC2,
        },
      },
    } as unknown as ReadableSpan;
    expect(parser.getOrigin(span)).toBe('AWS::ECS::EC2');
  });

  it('should return AWS::ECS::Fargate for AWS ECS platform with Fargate launch type', () => {
    const span: ReadableSpan = {
      resource: {
        attributes: {
          [SEMRESATTRS_CLOUD_PROVIDER]: CLOUDPROVIDERVALUES_AWS,
          [SEMRESATTRS_CLOUD_PLATFORM]: CLOUDPLATFORMVALUES_AWS_ECS,
          [SEMRESATTRS_AWS_ECS_LAUNCHTYPE]: 'fargate',
        },
      },
    } as unknown as ReadableSpan;
    expect(parser.getOrigin(span)).toBe('AWS::ECS::Fargate');
  });

  it('should return AWS::EC2::Instance for AWS EC2 platform', () => {
    const span: ReadableSpan = {
      resource: {
        attributes: {
          [SEMRESATTRS_CLOUD_PROVIDER]: CLOUDPROVIDERVALUES_AWS,
          [SEMRESATTRS_CLOUD_PLATFORM]: CLOUDPLATFORMVALUES_AWS_EC2,
        },
      },
    } as unknown as ReadableSpan;
    expect(parser.getOrigin(span)).toBe('AWS::EC2::Instance');
  });

  it('should return undefined for unknown cloud platform', () => {
    const span: ReadableSpan = {
      resource: {
        attributes: {
          [SEMRESATTRS_CLOUD_PROVIDER]: CLOUDPROVIDERVALUES_AWS,
          [SEMRESATTRS_CLOUD_PLATFORM]: 'unknown_platform',
        },
      },
    } as unknown as ReadableSpan;
    expect(parser.getOrigin(span)).toBeUndefined();
  });
});
