import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { EnhancedReadableSpan } from '../src';

describe('super.span test', () => {
  describe('isThrottled', () => {
    it('should return true if HTTP status code is 429 and others should be undefined', () => {
      const span: ReadableSpan = {
        attributes: { 'http.status_code': 429 },
      } as unknown as ReadableSpan;
      const enhancedSpan = new EnhancedReadableSpan(span);

      expect(enhancedSpan.isThrottled()).toBe(true);
      expect(enhancedSpan.isFault()).toBeUndefined();
      expect(enhancedSpan.isError()).toBe(true);
    });

    it('should return undefined if HTTP status code is not 429', () => {
      const span: ReadableSpan = {
        attributes: { 'http.status_code': 500 },
      } as unknown as ReadableSpan;
      const enhancedSpan = new EnhancedReadableSpan(span);

      expect(enhancedSpan.isThrottled()).toBeUndefined();
    });

    it('should return undefined if HTTP status code is not set', () => {
      const span: ReadableSpan = { attributes: {} } as unknown as ReadableSpan;
      const enhancedSpan = new EnhancedReadableSpan(span);

      expect(enhancedSpan.isThrottled()).toBeUndefined();
    });
  });

  describe('isFault', () => {
    it('should return true if HTTP status code is in the range of 500-599 and others should be undefined', () => {
      const span: ReadableSpan = {
        attributes: { 'http.status_code': 500 },
      } as unknown as ReadableSpan;
      const enhancedSpan = new EnhancedReadableSpan(span);

      expect(enhancedSpan.isFault()).toBe(true);
      expect(enhancedSpan.isThrottled()).toBeUndefined();
      expect(enhancedSpan.isError()).toBeUndefined();
    });

    it('should return undefined if HTTP status code is less than 500', () => {
      const span: ReadableSpan = {
        attributes: { 'http.status_code': 400 },
      } as unknown as ReadableSpan;
      const enhancedSpan = new EnhancedReadableSpan(span);

      expect(enhancedSpan.isFault()).toBeUndefined();
    });

    it('should return undefined if HTTP status code is not set', () => {
      const span: ReadableSpan = { attributes: {} } as unknown as ReadableSpan;
      const enhancedSpan = new EnhancedReadableSpan(span);

      expect(enhancedSpan.isFault()).toBeUndefined();
    });
  });

  describe('isError', () => {
    it('should return true if HTTP status code is in the range of 400-499 and others should be undefined', () => {
      const span: ReadableSpan = {
        attributes: { 'http.status_code': 400 },
      } as unknown as ReadableSpan;
      const enhancedSpan = new EnhancedReadableSpan(span);

      expect(enhancedSpan.isError()).toBe(true);
      expect(enhancedSpan.isThrottled()).toBeUndefined();
      expect(enhancedSpan.isFault()).toBeUndefined();
    });

    it('should return undefined if HTTP status code is less than 400', () => {
      const span: ReadableSpan = {
        attributes: { 'http.status_code': 200 },
      } as unknown as ReadableSpan;
      const enhancedSpan = new EnhancedReadableSpan(span);

      expect(enhancedSpan.isError()).toBeUndefined();
    });

    it('should return undefined if HTTP status code is not set', () => {
      const span: ReadableSpan = { attributes: {} } as unknown as ReadableSpan;
      const enhancedSpan = new EnhancedReadableSpan(span);

      expect(enhancedSpan.isError()).toBeUndefined();
    });
  });
});
