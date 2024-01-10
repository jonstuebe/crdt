/**
 * Represents a Hybrid Logical Clock (HLC) timestamp.
 */
export class HLC {
  timestamp: string;
  counter: number;
  nodeId: string;

  /**
   * Creates a new instance of the HLC class.
   * @param args - The arguments for initializing the HLC timestamp.
   * @param args.timestamp - Optional timestamp to set. If not provided, the current date and time will be used.
   * @param args.counter - Optional counter value. If not provided, the counter will be set to 0.
   * @param args.nodeId - The ID of the node associated with the HLC timestamp.
   */
  constructor(args: { timestamp?: string; counter?: number; nodeId: string }) {
    this.timestamp = args.timestamp ?? new Date().toISOString();
    this.counter = args.counter ?? 0;
    this.nodeId = args.nodeId;
  }

  /**
   * Increments the counter and updates the timestamp.
   * @param timestamp - Optional timestamp to set. If not provided, the current date and time will be used.
   * @returns void
   */
  public change(timestamp?: string): void {
    this.counter = this.counter + 1;
    this.timestamp = timestamp ?? new Date().toISOString();
  }

  /**
   * Returns a string representation of the HLC timestamp.
   * The string format is: "{timestamp}-{counter}-{nodeId}".
   * @returns {string} The string representation of the HLC timestamp.
   */
  public get(): string {
    return `${this.timestamp}-${String(this.counter).padStart(4, "0")}-${
      this.nodeId
    }`;
  }

  /**
   * Decodes a message timestamp into an HLC object.
   * @param messageTimestamp - The message timestamp to decode.
   * @returns The decoded HLC object.
   * @throws Error if the message timestamp is invalid.
   */
  static decode(messageTimestamp: string) {
    const regex = /(.{24})-(.{4})-(.*)/;
    const matches = messageTimestamp.match(regex);

    if (!matches || matches.length < 4) {
      throw new Error("Invalid HLC");
    }

    const timestamp = matches[1];
    const counter = matches[2];
    const nodeId = matches[3];

    return new HLC({
      timestamp,
      counter: parseInt(counter),
      nodeId,
    });
  }
}
