import { KinesisStreamEvent } from 'aws-lambda';
import axios from 'axios';

type TCompletedBooking = {
  id: string;
  partitionKey: string;
  timestamp: number;
  type: 'booking_completed';
  booking_completed: {
    timestamp: number;
    orderId: number;
    product_provider: string;
  };
};

type TRequestedBooking = {
  id: string;
  partitionKey: string;
  timestamp: number;
  type: 'booking_requested';
  booking_requested: {
    timestamp: number;
    orderId: number;
    product_provider: string;
  };
};

type TDecodedEventData = TCompletedBooking | TRequestedBooking;

export const handler = (event: KinesisStreamEvent) => {
  for (const record of event.Records) {
    const decodedData = JSON.parse(
      atob(record.kinesis.data)
    ) as TDecodedEventData;

    if (decodedData.type !== 'booking_completed') {
      continue;
    }

    const formattedObject = {
      product_order_id_buyer: decodedData.booking_completed.orderId,
      timestamp: new Date(
        decodedData.booking_completed.timestamp
      ).toISOString(),
      product_provider_buyer: decodedData.booking_completed.product_provider,
    };

    axios
      .post(process.env.PUBLISH_URL as string, formattedObject)
      .then() //proper handling would be added in real cases.
      .catch((error) => console.log(error));
  }
};
