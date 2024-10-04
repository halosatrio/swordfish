import dayjs from "dayjs";

export const customLogger = (message: string, ...rest: string[]) => {
  let timestamp = dayjs().add(7, 'hour').format("YYYY-MM-DD - HH:mm:ss");
  console.log(timestamp, message, ...rest);
};
