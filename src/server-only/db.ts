import chalk from "chalk";
import postgres from "postgres"

// TODO: move config into .env file
const postgresSql = postgres({
  host: "localhost",
  port: 5432,
  database: "apollo",
  username: "postgres",
  password: 'jZrZg7aLWkQu',
  debug: true,
  onnotice: notice => console.log(chalk.green('NOTICE'), notice.message),
  types: {
    numeric: {
      to: 1700, // PG numeric type
      from: [1700],
      serialize: (value: any) => value.toString(),
      parse: (value: string) => parseFloat(value)
    }
  }
});

export const onError = (error: Error & { [key: string]: any }) => {
  if (error.name === 'PostgresError') {
    console.log()
    console.log(error.query.trim().replaceAll(/\n\s+/g, '\n'))
    if (error.parameters && error.parameters.length > 0) {
      console.log(error.parameters)
    }
    console.log(chalk.red('ERROR'), error.message)
  } else if (error.code === 'UNDEFINED_VALUE') {
    console.log(error)
    console.log(chalk.red('ERROR'), error.message)
  } else {
    console.error(error)
  }
  return undefined
}

// Wrap sql with a proxy to automatically handle errors
export const sql = new Proxy(postgresSql, {
  get(target, prop) {
    const original = target[prop as keyof typeof target];
    if (typeof original === 'function') {
      return async (...args: any[]) => {
        try {
          return await (original as Function).call(target, ...args);
        } catch (error) {
          return onError(error as Error & { [key: string]: any });
        }
      };
    }
    return original;
  }
});
