import { handler } from '../src';
import event from '../event.json';
import axios from 'axios';

describe('Event Handler', () => {
  vi.mock('axios', async () => {
    const actual = (await vi.importActual('axios')) as object;
    return {
      ...actual,
      axios: vi.fn().mockImplementation(() => {
        return { post: vi.fn() };
      }),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const testEvent = {
    Records: [
      {
        kinesis: {
          data:
            // eslint-disable-next-line max-len
            'eyJpZCI6ImE0Mzg4MTMxLTE0OTItMTFlYy1hMGIyLWM3OGZmYmQ2OTM0NyIsInBhcnRpdGlvbktleSI6ImM3NzI0YjA2LTgxM2QtNDEwYS1hZGJjLTdkMTllYmZmMDRiMiIsInRpbWVzdGFtcCI6MTYzMTUzODA1OTQ1OSwidHlwZSI6ImJvb2tpbmdfcmVxdWVzdGVkIiwiYm9va2luZ19yZXF1ZXN0ZWQiOnsidGltZXN0YW1wIjoxNjMxNTM4MDU5NDU5LCJvcmRlcklkIjoxMDAxNiwicHJvZHVjdF9wcm92aWRlciI6IkJyaXR0YW55IEZlcnJpZXMifX0=',
          partitionKey: 'c7724b06-813d-410a-adbc-7d19ebff04b2',
          approximateArrivalTimestamp: 1631538059459,
          kinesisSchemaVersion: '1.0',
          sequenceNumber: 'c7724b06-813d-410a-adbc-7d19ebff04b2',
        },
        eventSource: 'aws:kinesis',
        eventID:
          'shardId-000000000000:49545115243490985018280067714973144582180062593244200961',
        invokeIdentityArn: 'arn:aws:iam::EXAMPLE',
        eventVersion: '1.0',
        eventName: 'aws:kinesis:record',
        eventSourceARN: 'arn:aws:kinesis:EXAMPLE',
        awsRegion: 'us-east-1',
      },
    ],
  };

  it('should fail if the server is unresponsive', () => {
    const mockAxios = vi.spyOn(axios, 'post');
    expect(handler(event)).toBeUndefined();
    expect(mockAxios).toBeCalledWith(
      undefined,
      expect.objectContaining({
        product_order_id_buyer: expect.anything(),
        product_provider_buyer: expect.anything(),
        timestamp: expect.anything(),
      })
    );
  });

  it('Should not sent to servers non-required booking types', () => {
    const mockAxios = vi.spyOn(axios, 'post');

    expect(handler(testEvent)).toBeUndefined();
    expect(mockAxios).toBeCalledTimes(0);
  });

  it('Should complete all handed events', () => {
    const mockAxios = vi.spyOn(axios, 'post').mockResolvedValue({});
    expect(handler(event)).toBeUndefined();
    expect(mockAxios).toBeCalledWith(
      undefined,
      expect.objectContaining({
        product_order_id_buyer: expect.anything(),
        product_provider_buyer: expect.anything(),
        timestamp: expect.anything(),
      })
    );
    expect(mockAxios).toReturn();
  });
});
