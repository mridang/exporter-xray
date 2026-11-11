/**
 * Maps the cloud platform of a span's resource to an AWS X-Ray origin.
 * @file
 */
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import {
  CLOUDPLATFORMVALUES_AWS_EC2,
  CLOUDPLATFORMVALUES_AWS_ECS,
  CLOUDPLATFORMVALUES_AWS_EKS,
  CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK,
  CLOUDPROVIDERVALUES_AWS,
  SEMRESATTRS_AWS_ECS_LAUNCHTYPE,
  SEMRESATTRS_CLOUD_PLATFORM,
  SEMRESATTRS_CLOUD_PROVIDER,
} from '@opentelemetry/semantic-conventions';

export interface OriginParser {
  getOrigin(span: ReadableSpan): string | undefined;
}

export class DefaultOriginParser implements OriginParser {
  /**
   * Determines the origin of the span based on resource attributes.
   * @param span - The span whose resource attributes are inspected.
   * @returns The determined origin, or undefined if no
   * relevant attributes are found.
   * @example
   * ```ts
   * const parser = new DefaultOriginParser();
   * parser.getOrigin(span); // Returns 'AWS::EC2::Instance' for an EC2 span.
   * ```
   */
  public getOrigin(span: ReadableSpan): string | undefined {
    const attributes = span.resource?.attributes;
    if (!attributes) {
      return undefined;
    }
    if (attributes[SEMRESATTRS_CLOUD_PROVIDER] !== CLOUDPROVIDERVALUES_AWS) {
      return undefined;
    }
    switch (attributes[SEMRESATTRS_CLOUD_PLATFORM]) {
      case 'aws_app_runner': {
        return 'AWS::AppRunner::Service';
      }
      case CLOUDPLATFORMVALUES_AWS_EKS: {
        return 'AWS::EKS::Container';
      }
      case CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK: {
        return 'AWS::ElasticBeanstalk::Environment';
      }
      case CLOUDPLATFORMVALUES_AWS_ECS: {
        return this.getEcsOrigin(attributes[SEMRESATTRS_AWS_ECS_LAUNCHTYPE]);
      }
      case CLOUDPLATFORMVALUES_AWS_EC2: {
        return 'AWS::EC2::Instance';
      }
      default: {
        return undefined;
      }
    }
  }

  /**
   * Determines the origin of an ECS span from its launch type.
   * @param launchType - The ECS launch type, such as 'ec2' or 'fargate'.
   * @returns The ECS origin matching the launch type.
   * @example
   * ```ts
   * // A launch type of 'fargate' maps to 'AWS::ECS::Fargate'.
   * // A missing launch type maps to 'AWS::ECS::Container'.
   * ```
   */
  private getEcsOrigin(launchType: unknown): string {
    if (!launchType) {
      return 'AWS::ECS::Container';
    }
    switch (launchType) {
      case CLOUDPLATFORMVALUES_AWS_EC2: {
        return 'AWS::ECS::EC2';
      }
      case 'fargate': {
        return 'AWS::ECS::Fargate';
      }
      default: {
        return 'AWS::ECS::Container';
      }
    }
  }
}
