/**
 * Helper that wraps recorded span fixtures as readable spans.
 * @file
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { SpanKind, SpanStatusCode, TraceFlags } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';
import type { ReadableSpan, TimedEvent } from '@opentelemetry/sdk-trace-base';
import type {
  Attributes,
  HrTime,
  Link,
  SpanContext,
  SpanStatus,
} from '@opentelemetry/api';
import type { Resource } from '@opentelemetry/resources';
import type { InstrumentationScope } from '@opentelemetry/core';

interface SpanData {
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
  resource: Resource;
  instrumentationScope: InstrumentationScope;
  droppedAttributesCount: number;
  droppedEventsCount: number;
  droppedLinksCount: number;
}

function isSpanData(value: unknown): value is SpanData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const fields: Record<string, unknown> = Object.fromEntries(
    Object.entries(value),
  );
  return (
    ['traceId', 'id', 'name'].every((key) => typeof fields[key] === 'string') &&
    ['timestamp', 'duration'].every((key) => typeof fields[key] === 'number')
  );
}

export class WrappedReadableSpan implements ReadableSpan {
  readonly name: string;
  readonly kind: SpanKind;
  readonly parentSpanContext?: SpanContext;
  readonly startTime: HrTime;
  readonly endTime: HrTime;
  readonly status: SpanStatus;
  readonly attributes: Attributes;
  readonly links: Link[];
  readonly events: TimedEvent[];
  readonly duration: HrTime;
  readonly ended: boolean;
  readonly resource: Resource;
  readonly instrumentationScope: InstrumentationScope;
  readonly droppedAttributesCount: number;
  readonly droppedEventsCount: number;
  readonly droppedLinksCount: number;
  private readonly _spanContext: SpanContext;

  constructor(private readonly spanData: SpanData) {
    this.name = spanData.name;
    this.kind = spanData.kind;
    this.parentSpanContext =
      spanData.parentId === undefined
        ? undefined
        : {
            traceId: spanData.traceId,
            spanId: spanData.parentId,
            traceFlags: TraceFlags.SAMPLED,
          };
    this.status = spanData.status;
    this.attributes = spanData.attributes;
    this.links = spanData.links;
    this.events = spanData.events;
    this.ended = spanData.ended;
    this.resource = spanData.resource;
    this.instrumentationScope = spanData.instrumentationScope;
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

  static async from(filename: string): Promise<WrappedReadableSpan[]> {
    const filePath = fileURLToPath(
      new URL(`samples/${filename}`, import.meta.url),
    );
    const rawData = await readFile(filePath, 'utf8');
    const spans: unknown = JSON.parse(rawData);
    if (!Array.isArray(spans) || !spans.every(isSpanData)) {
      throw new TypeError(`${filename} must hold a list of spans`);
    }
    return spans.map((span) => new WrappedReadableSpan(span));
  }
}

/**
 * Builds a complete span with empty defaults, so a test states only what it needs.
 * @param [overrides] - The values the test cares about.
 * @param [overrides.attributes] - The span attributes.
 * @param [overrides.events] - The span events, without their timestamps.
 * @param [overrides.kind] - The span kind.
 * @param [overrides.resourceAttributes] - The attributes of the span's resource.
 * @returns The span.
 * @example
 * ```ts
 * spanOf({ attributes: { 'http.status_code': 429 } });
 * ```
 */
export function spanOf(
  overrides: {
    attributes?: Attributes;
    events?: Pick<TimedEvent, 'name' | 'attributes'>[];
    kind?: SpanKind;
    resourceAttributes?: Attributes;
  } = {},
): ReadableSpan {
  return new WrappedReadableSpan({
    traceId: '',
    id: '',
    name: '',
    kind: overrides.kind ?? SpanKind.INTERNAL,
    timestamp: 0,
    duration: 0,
    status: { code: SpanStatusCode.UNSET },
    attributes: overrides.attributes ?? {},
    links: [],
    events: (overrides.events ?? []).map((event) => ({
      ...event,
      time: [0, 0],
    })),
    ended: true,
    resource: resourceFromAttributes(overrides.resourceAttributes ?? {}),
    instrumentationScope: { name: '' },
    droppedAttributesCount: 0,
    droppedEventsCount: 0,
    droppedLinksCount: 0,
  });
}
