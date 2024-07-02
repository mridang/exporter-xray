import { ReadableSpan, TimedEvent } from '@opentelemetry/sdk-trace-base';
import {
  Attributes,
  HrTime,
  Link,
  SpanContext,
  SpanKind,
  SpanStatus,
} from '@opentelemetry/api';
import { IResource } from '@opentelemetry/resources';
import { InstrumentationScope } from '@opentelemetry/core/build/src/common/types';
import { join } from 'path';
import { readFileSync } from 'fs';

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
  instrumentationLibrary: InstrumentationScope;
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
  readonly attributes: Attributes;
  readonly links: Link[];
  readonly events: TimedEvent[];
  readonly duration: HrTime;
  readonly ended: boolean;
  readonly resource: IResource;
  readonly instrumentationLibrary: InstrumentationScope;
  readonly droppedAttributesCount: number;
  readonly droppedEventsCount: number;
  readonly droppedLinksCount: number;
  private readonly _spanContext: SpanContext;

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
    this.startTime = [
      Math.floor(spanData.timestamp / 1e6),
      (spanData.timestamp % 1e6) * 1e3,
    ];
    this.duration = [
      Math.floor(spanData.duration / 1e6),
      (spanData.duration % 1e6) * 1e3,
    ];
    this.endTime = [
      this.startTime[0] +
        this.duration[0] +
        Math.floor((this.startTime[1] + this.duration[1]) / 1e9),
      (this.startTime[1] + this.duration[1]) % 1e9,
    ];
    this._spanContext = {
      traceId: spanData.traceId,
      spanId: spanData.id,
      traceFlags: 1,
    };
  }

  spanContext(): SpanContext {
    return this._spanContext;
  }

  static from(filename: string): WrappedReadableSpan[] {
    const filePath = join(__dirname, 'samples', filename);
    const rawData = readFileSync(filePath, 'utf-8');
    return (JSON.parse(rawData) as SpanData[]).map(
      (span) => new WrappedReadableSpan(span),
    );
  }
}
