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
   *
   * @returns {string | undefined} The determined origin, or undefined if no
   * relevant attributes are found.
   */
  public getOrigin(span: ReadableSpan): string | undefined {
    if (!span.resource?.attributes) {
      return undefined;
    } else {
      if (
        span.resource?.attributes[SEMRESATTRS_CLOUD_PROVIDER] !==
        CLOUDPROVIDERVALUES_AWS
      ) {
        return undefined;
      } else {
        switch (span.resource?.attributes[SEMRESATTRS_CLOUD_PLATFORM]) {
          case 'aws_app_runner':
            return 'AWS::AppRunner::Service';
          case CLOUDPLATFORMVALUES_AWS_EKS:
            return 'AWS::EKS::Container';
          case CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK:
            return 'AWS::ElasticBeanstalk::Environment';
          case CLOUDPLATFORMVALUES_AWS_ECS:
            if (!span.resource?.attributes[SEMRESATTRS_AWS_ECS_LAUNCHTYPE]) {
              return 'AWS::ECS::Container';
            }
            switch (span.resource?.attributes[SEMRESATTRS_AWS_ECS_LAUNCHTYPE]) {
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
}
