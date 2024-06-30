import { ReadableSpan, TimedEvent } from '@opentelemetry/sdk-trace-base';
import {
  Attributes,
  HrTime,
  Link,
  SpanAttributes,
  SpanContext,
  SpanKind,
  SpanStatus,
} from '@opentelemetry/api';
import { IResource } from '@opentelemetry/resources';
import {
  hrTimeDuration,
  InstrumentationLibrary,
  timeInputToHrTime,
} from '@opentelemetry/core';

export interface SpanData {
  traceId: string;
  id: string;
  parentId?: string;
  traceState?: string;
  name: string;
  kind: SpanKind;
  timestamp: number;
  duration: number;
  status: SpanStatus;
  attributes: Attributes;
  links: Link[];
  events: TimedEvent[];
  ended: boolean;
  resource: IResource;
  instrumentationLibrary: InstrumentationLibrary;
  droppedAttributesCount: number;
  droppedEventsCount: number;
  droppedLinksCount: number;
}

export class WrappedReadableSpan implements ReadableSpan {
  readonly name: string;
  readonly kind: SpanKind;
  readonly parentSpanId?: string;
  readonly startTime: HrTime;
  readonly endTime: HrTime;
  readonly status: SpanStatus;
  readonly attributes: SpanAttributes;
  readonly links: Link[];
  readonly events: TimedEvent[];
  readonly duration: HrTime;
  readonly ended: boolean;
  readonly resource: IResource;
  readonly instrumentationLibrary: InstrumentationLibrary;
  readonly droppedAttributesCount: number;
  readonly droppedEventsCount: number;
  readonly droppedLinksCount: number;

  private _spanContext: SpanContext;

  constructor(private readonly spanData: SpanData) {
    this.name = spanData.name;
    this.kind = spanData.kind;
    this.parentSpanId = spanData.parentId;
    this.status = spanData.status;
    this.attributes = spanData.attributes;
    this.links = spanData.links;
    this.events = spanData.events;
    this.ended = spanData.ended;
    this.resource = spanData.resource;
    this.instrumentationLibrary = spanData.instrumentationLibrary;
    this.droppedAttributesCount = spanData.droppedAttributesCount;
    this.droppedEventsCount = spanData.droppedEventsCount;
    this.droppedLinksCount = spanData.droppedLinksCount;
    this.startTime = timeInputToHrTime(spanData.timestamp / 1000);
    this.duration = timeInputToHrTime(spanData.duration / 1000);
    this.endTime = hrTimeDuration(this.startTime, this.duration);
    this._spanContext = {
      traceId: spanData.traceId,
      spanId: spanData.id,
      traceFlags: 1,
    };
  }

  spanContext(): SpanContext {
    return this._spanContext;
  }
}
