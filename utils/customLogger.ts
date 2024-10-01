import dayjs from "dayjs";

export const customLogger = (message: string, ...rest: string[]) => {
  let timestamp = dayjs().format("YYYY-MM-DD - HH:mm:ss");
  console.log(timestamp, message, ...rest);
};
